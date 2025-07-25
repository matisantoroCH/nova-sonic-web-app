import React, { createRef } from 'react';
import { Icon, Alert, Button, Modal, Box, SpaceBetween, Container, ColumnLayout, Header, FormField, Select, Textarea, Checkbox } from '@cloudscape-design/components';
import S2sEvent from '../helper/s2sEvents';
import Meter from './Meter';
import S2sEventDisplay from './EventDisplay';
import { base64ToFloat32Array } from '../helper/audioHelper';
import AudioPlayer from '../helper/audioPlayer';

interface ChatMessage {
    content: string;
    role: string;
    generationStage?: string;
    raw?: any[];
    stopReason?: string;
}

interface S2sChatBotState {
    status: string;
    alert: string | null;
    sessionStarted: boolean;
    showEventJson: boolean;
    showConfig: boolean;
    selectedEvent: any;
    chatMessages: Record<string, ChatMessage>;
    events: any[];
    audioChunks: any[];
    audioPlayPromise: any;
    includeChatHistory: boolean;
    promptName: string | null;
    textContentName: string | null;
    audioContentName: string | null;
    showUsage: boolean;
    configAudioInput: any;
    configSystemPrompt: string;
    configAudioOutput: any;
    configVoiceIdOption: { label: string; value: string };
    configToolUse: string;
    configChatHistory: string;
    isPlaying?: boolean;
}

class S2sChatBot extends React.Component<{}, S2sChatBotState> {
    private socket: WebSocket | null;
    private mediaRecorder: MediaRecorder | null;
    private chatMessagesEndRef: React.RefObject<HTMLDivElement | null>;
    private stateRef: React.RefObject<S2sChatBotState | null>;
    private eventDisplayRef: React.RefObject<S2sEventDisplay | null>;
    private meterRef: React.RefObject<Meter | null>;
    private audioPlayer: AudioPlayer;

    constructor(props: {}) {
        super(props);
        this.state = {
            status: "loading",
            alert: null,
            sessionStarted: false,
            showEventJson: false,
            showConfig: false,
            selectedEvent: null,
            chatMessages: {},
            events: [],
            audioChunks: [],
            audioPlayPromise: null,
            includeChatHistory: false,
            promptName: null,
            textContentName: null,
            audioContentName: null,
            showUsage: true,
            configAudioInput: null,
            configSystemPrompt: S2sEvent.DEFAULT_SYSTEM_PROMPT,
            configAudioOutput: S2sEvent.DEFAULT_AUDIO_OUTPUT_CONFIG,
            configVoiceIdOption: { label: "Carlos (Spanish)", value: "carlos" },
            configToolUse: JSON.stringify(S2sEvent.DEFAULT_TOOL_CONFIG, null, 2),
            configChatHistory: JSON.stringify(S2sEvent.DEFAULT_CHAT_HISTORY, null, 2),
        };
        this.socket = null;
        this.mediaRecorder = null;
        this.chatMessagesEndRef = React.createRef<HTMLDivElement>();
        this.stateRef = { current: null };
        this.eventDisplayRef = React.createRef<S2sEventDisplay>();
        this.meterRef = React.createRef<Meter>();
        this.audioPlayer = new AudioPlayer();
    }

    componentDidMount() {
        this.stateRef.current = this.state;
        // Initialize audio player early
        this.audioPlayer.start().catch(err => {
            console.error("Failed to initialize audio player:", err);
        });
    }

    componentWillUnmount() {
        this.audioPlayer.stop();
    }

    componentDidUpdate(prevProps: {}, prevState: S2sChatBotState) {
        this.stateRef.current = this.state; 

        if (prevState.chatMessages !== this.state.chatMessages) {
            this.chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    sendEvent(event: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const eventType = Object.keys(event?.event)[0];
            console.log(`📤 Sending event: ${eventType}`);
            this.socket.send(JSON.stringify(event));
            event.timestamp = Date.now();

            this.eventDisplayRef.current?.displayEvent(event, "out");
        } else {
            console.warn("⚠️ WebSocket not ready for sending event");
        }
    }
    
    cancelAudio() {
        this.audioPlayer.bargeIn();
        this.setState({ isPlaying: false });
    }

    handleIncomingMessage(message: any) {
        const eventType = Object.keys(message?.event)[0];
        const role = message.event[eventType]["role"];
        const content = message.event[eventType]["content"];
        const contentId = message.event[eventType].contentId;
        let stopReason = message.event[eventType].stopReason;
        const contentType = message.event[eventType].type;
        var chatMessages = this.state.chatMessages;

        switch(eventType) {
            case "textOutput": 
                // Detect interruption
                if (role === "ASSISTANT" && content.startsWith("{")) {
                    const evt = JSON.parse(content);
                    if (evt.interrupted === true) {
                        this.cancelAudio();
                    }
                }

                if (chatMessages.hasOwnProperty(contentId)) {
                    chatMessages[contentId].content = content;
                    chatMessages[contentId].role = role;
                    if (chatMessages[contentId].raw === undefined)
                        chatMessages[contentId].raw = [];
                    chatMessages[contentId].raw!.push(message);
                }
                this.setState({chatMessages: chatMessages});
                break;
            case "audioOutput":
                try {
                    const base64Data = message.event[eventType].content;
                    const audioData = base64ToFloat32Array(base64Data);
                    this.audioPlayer.playAudio(audioData);
                } catch (error) {
                    console.error("Error processing audio chunk:", error);
                }
                break;
            case "contentStart":
                if (contentType === "TEXT") {
                    var generationStage = "";
                    if (message.event.contentStart.additionalModelFields) {
                        generationStage = JSON.parse(message.event.contentStart.additionalModelFields)?.generationStage;
                    }

                    chatMessages[contentId] =  {
                        "content": "", 
                        "role": role,
                        "generationStage": generationStage,
                        "raw": [],
                    };
                    chatMessages[contentId].raw!.push(message);
                    this.setState({chatMessages: chatMessages});
                }
                break;
            case "contentEnd":
                if (contentType === "TEXT") {
                    if (chatMessages.hasOwnProperty(contentId)) {
                        if (chatMessages[contentId].raw === undefined)
                            chatMessages[contentId].raw = [];
                        chatMessages[contentId].raw!.push(message);
                        chatMessages[contentId].stopReason = stopReason;
                    }
                    this.setState({chatMessages: chatMessages});
                }
                break;
            case "usageEvent":
                if (this.meterRef.current) { 
                    this.meterRef.current.updateMeter(message);
                    if (this.state.showUsage === false) {
                        this.setState({showUsage: true});
                    }
                }
                break;
            default:
                break;
        }

        this.eventDisplayRef.current?.displayEvent(message, "in");
    }

    handleSessionChange = () => {
        if (this.state.sessionStarted) {
            // End session
            this.endSession();
            this.cancelAudio();
            if (this.meterRef.current) this.meterRef.current.stop();
            this.audioPlayer.start(); 
        }
        else {
            // Start session
            this.setState({
                chatMessages:{}, 
                events: [], 
            });
            if (this.eventDisplayRef.current) this.eventDisplayRef.current.cleanup();
            if (this.meterRef.current) this.meterRef.current.start();
            
            // Init S2sSessionManager
            try {
                if (this.socket === null || this.socket.readyState !== WebSocket.OPEN) {
                    this.connectWebSocket();
                }

                // Start microphone 
                this.startMicrophone();
            } catch (error) {
                console.error('Error accessing microphone: ', error);
            }
        }
        this.setState({sessionStarted: !this.state.sessionStarted});
    }

    connectWebSocket() {
        // Connect to the S2S WebSocket server
        if (this.socket === null || this.socket.readyState !== WebSocket.OPEN) {
            const promptName = crypto.randomUUID();
            const textContentName = crypto.randomUUID();
            const audioContentName = crypto.randomUUID();
            this.setState({
                promptName: promptName,
                textContentName: textContentName,
                audioContentName: audioContentName
            });

            const ws_url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8081";
            this.socket = new WebSocket(ws_url);
            this.socket.onopen = () => {
                console.log("WebSocket connected!");
    
                // Start session events
                this.sendEvent(S2sEvent.sessionStart());

                var audioConfig = S2sEvent.DEFAULT_AUDIO_OUTPUT_CONFIG;
                audioConfig.voiceId = this.state.configVoiceIdOption.value;
                var toolConfig = this.state.configToolUse ? JSON.parse(this.state.configToolUse) : S2sEvent.DEFAULT_TOOL_CONFIG;

                this.sendEvent(S2sEvent.promptStart(promptName, audioConfig, toolConfig));

                this.sendEvent(S2sEvent.contentStartText(promptName, textContentName));

                this.sendEvent(S2sEvent.textInput(promptName, textContentName, this.state.configSystemPrompt));
                this.sendEvent(S2sEvent.contentEnd(promptName, textContentName));

                // Chat history
                if (this.state.includeChatHistory) {
                    var chatHistory = JSON.parse(this.state.configChatHistory);
                    if (chatHistory === null) chatHistory = S2sEvent.DEFAULT_CHAT_HISTORY;
                    for (const chat of chatHistory) {
                        const chatHistoryContentName = crypto.randomUUID();
                        this.sendEvent(S2sEvent.contentStartText(promptName, chatHistoryContentName, chat.role));
                        this.sendEvent(S2sEvent.textInput(promptName, chatHistoryContentName, chat.content));
                        this.sendEvent(S2sEvent.contentEnd(promptName, chatHistoryContentName));
                    }
                }

                this.sendEvent(S2sEvent.contentStartAudio(promptName, audioContentName));
            };

            // Handle incoming messages
            this.socket.onmessage = (message) => {
                const event = JSON.parse(message.data);
                this.handleIncomingMessage(event);
            };
        
            // Handle errors
            this.socket.onerror = (error) => {
                this.setState({alert: "WebSocket Error: " + error});
                console.error("WebSocket Error: ", error);
            };
        
            // Handle connection close
            this.socket.onclose = () => {
                console.log("WebSocket Disconnected");
                if (this.state.sessionStarted)
                    this.setState({alert: "WebSocket Disconnected"});
            };
        }
    }
      
    async startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
    
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                latencyHint: 'interactive'
            });
    
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(512, 1, 1);
    
            source.connect(processor);
            processor.connect(audioContext.destination);
    
            const targetSampleRate = 16000;
    
            processor.onaudioprocess = async (e) => {
                if (this.state.sessionStarted) {
                    const inputBuffer = e.inputBuffer;
    
                    // Create an offline context for resampling
                    const offlineContext = new OfflineAudioContext({
                        numberOfChannels: 1,
                        length: Math.ceil(inputBuffer.duration * targetSampleRate),
                        sampleRate: targetSampleRate
                    });
    
                    // Copy input to offline context buffer
                    const offlineSource = offlineContext.createBufferSource();
                    const monoBuffer = offlineContext.createBuffer(1, inputBuffer.length, inputBuffer.sampleRate);
                    monoBuffer.copyToChannel(inputBuffer.getChannelData(0), 0);
    
                    offlineSource.buffer = monoBuffer;
                    offlineSource.connect(offlineContext.destination);
                    offlineSource.start(0);
    
                    // Resample and get the rendered buffer
                    const renderedBuffer = await offlineContext.startRendering();
                    const resampled = renderedBuffer.getChannelData(0);
    
                    // Convert to Int16 PCM
                    const buffer = new ArrayBuffer(resampled.length * 2);
                    const pcmData = new DataView(buffer);
    
                    for (let i = 0; i < resampled.length; i++) {
                        const s = Math.max(-1, Math.min(1, resampled[i]));
                        pcmData.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                    }
    
                    // Convert to binary string and base64 encode
                    let binary = '';
                    for (let i = 0; i < pcmData.byteLength; i++) {
                        binary += String.fromCharCode(pcmData.getUint8(i));
                    }
    
                    const currentState = this.stateRef.current;
                    if (currentState) {
                        console.log(`🎤 Sending audio chunk - Prompt: ${currentState.promptName}, Content: ${currentState.audioContentName}`);
                        const event = S2sEvent.audioInput(
                            currentState.promptName,
                            currentState.audioContentName,
                            btoa(binary)
                        );
                        this.sendEvent(event);
                    } else {
                        console.warn("⚠️ No current state available for audio input");
                    }
                }
            };
    
            (window as any).audioCleanup = () => {
                processor.disconnect();
                source.disconnect();
                stream.getTracks().forEach(track => track.stop());
            };
    
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.ondataavailable = (event) => {
                this.state.audioChunks.push(event.data);
            };
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
                // Convert Blob to base64 string
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    this.sendEvent(S2sEvent.audioInput(this.state.promptName, this.state.audioContentName, base64String));
                };
                reader.readAsDataURL(audioBlob);
                this.setState({ audioChunks: [] });
            };
    
            this.mediaRecorder.start();
            this.setState({ sessionStarted: true });
            console.log('Microphone recording started');
    
        } catch (error) {
            console.error('Error accessing microphone: ', error);
        }
    }

    endSession() {
        if (this.socket) {
            // Close microphone
            if (this.mediaRecorder && this.state.sessionStarted) {
                this.mediaRecorder.stop();
                console.log('Microphone recording stopped');
            }

            // Close S2sSessionManager
            this.sendEvent(S2sEvent.contentEnd(this.state.promptName, this.state.audioContentName));
            this.sendEvent(S2sEvent.promptEnd(this.state.promptName));
            this.sendEvent(S2sEvent.sessionEnd());

            // Close websocket
            this.socket.close();

            this.setState({sessionStarted: false});
        }
    }

    render() {
        return (
            <div className="s2s">
                {this.state.alert !== null && this.state.alert.length > 0?
                <div><Alert statusIconAriaLabel="Warning" type="warning">
                {this.state.alert}
                </Alert><br/></div>:<div/>}
                <div className='top'>
                    <div className='action'>
                        <Button variant='primary' onClick={this.handleSessionChange}>
                            <Icon name={this.state.sessionStarted?"microphone-off":"microphone"} />&nbsp;&nbsp;
                            {this.state.sessionStarted?"End Conversation":"Start Conversation"}
                        </Button>
                        <div className='chathistory'>
                            <Checkbox checked={this.state.includeChatHistory} onChange={({ detail }) => this.setState({includeChatHistory: detail.checked})}>Include chat history</Checkbox>
                            <div className='desc'>You can view sample chat history in the settings.</div>
                        </div>
                    </div>
                    {this.state.showUsage && <Meter ref={this.meterRef}/>}
                    <div className='setting'>
                        <Button onClick={()=> 
                            this.setState({
                                showConfig: true, 
                            })
                        }>
                            <Icon name="settings"/>
                        </Button>
                    </div>
                </div>
                <br/>
                <ColumnLayout columns={2}>
                    <Container header={
                        <Header variant="h2">Conversation</Header>
                    }>
                    <div className="chatarea">
                        {Object.keys(this.state.chatMessages).map((key,index) => {
                            const msg = this.state.chatMessages[key];
                            return <div key={index} className='item'>
                                    <div className={msg.role === "USER"?"user":"bot"} onClick={()=> 
                                            this.setState({
                                                showEventJson: true, 
                                                selectedEvent: {events:msg.raw}
                                            })
                                        }>
                                        <Icon name={msg.role === "USER"?"user-profile":"gen-ai"} />&nbsp;&nbsp;
                                        {msg.content}
                                        {msg.role === "ASSISTANT" && msg.generationStage? ` [${msg.generationStage}]`:""}
                                    </div>
                                </div>
                        })}
                        <div className='endbar' ref={this.chatMessagesEndRef}></div>
                    </div>
                    </Container>
                    <Container header={
                        <Header variant="h2">Events</Header>
                    }>
                        <S2sEventDisplay ref={this.eventDisplayRef}></S2sEventDisplay>
                    </Container>
                </ColumnLayout>
                <Modal
                    onDismiss={() => this.setState({showEventJson: false})}
                    visible={this.state.showEventJson}
                    header="Event details"
                    size='medium'
                    footer={
                        <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => this.setState({showEventJson: false})}>Close</Button>
                        </SpaceBetween>
                        </Box>
                    }
                >
                    <div className='eventdetail'>
                    <pre id="jsonDisplay">
                        {this.state.selectedEvent && this.state.selectedEvent.events.map((e: any, i: number) => {
                            const eventType = Object.keys(e?.event)[0];
                            if (eventType === "audioInput" || eventType === "audioOutput")
                                e.event[eventType].content = e.event[eventType].content.substr(0,10) + "...";
                            const ts = new Date(e.timestamp).toLocaleString(undefined, {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                fractionalSecondDigits: 3, // Show milliseconds
                                hour12: false // 24-hour format
                            });
                            var displayJson = { ...e };
                            delete displayJson.timestamp;
                            return ts + "\n" + JSON.stringify(displayJson,null,2) + "\n";
                        })}
                    </pre>
                    </div>
                </Modal>
                <Modal  
                    onDismiss={() => this.setState({showConfig: false})}
                    visible={this.state.showConfig}
                    header="Nova S2S settings"
                    size='large'
                    footer={
                        <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button variant="link" onClick={() => this.setState({showConfig: false})}>Save</Button>
                        </SpaceBetween>
                        </Box>
                    }
                >
                    <div className='config'>
                        <FormField
                            label="Voice Id"
                            stretch={true}
                        >
                            <Select
                                selectedOption={this.state.configVoiceIdOption}
                                onChange={({ detail }) =>
                                    this.setState({configVoiceIdOption: detail.selectedOption as { label: string; value: string }})
                                }
                                options={[
                                    { label: "Carlos (Spanish)", value: "carlos" },
                                    { label: "Lupe (Spanish)", value: "lupe"},
                                    { label: "Matthew (en-US)", value: "matthew" },
                                    { label: "Tiffany (en-US)", value: "tiffany" },
                                    { label: "Amy (en-GB)", value: "amy" },
                                ]}
                                />
                        </FormField>
                        <br/>
                        <FormField
                            label="System prompt"
                            description="For the speech model"
                            stretch={true}
                        >
                            <Textarea
                                onChange={({ detail }) => this.setState({configSystemPrompt: detail.value})}
                                value={this.state.configSystemPrompt}
                                placeholder="Speech system prompt"
                                rows={5}
                            />
                        </FormField>
                        <br/>
                        <FormField
                            label="Tool use configuration"
                            description="For external integration such as RAG and Agents"
                            stretch={true}
                        >
                            <Textarea
                                onChange={({ detail }) => this.setState({configToolUse: detail.value})}
                                value={this.state.configToolUse}
                                rows={10}
                                placeholder="{}"
                            />
                        </FormField>
                        <br/>
                        <FormField
                            label="Chat history"
                            description="Sample chat history to resume conversation"
                            stretch={true}
                        >
                            <Textarea
                                onChange={({ detail }) => this.setState({configChatHistory: detail.value})}
                                value={this.state.configChatHistory}
                                rows={5}
                                placeholder="{}"
                            />
                        </FormField>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default S2sChatBot; 