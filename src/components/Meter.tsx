import React from 'react';
import { Icon, Button, Modal, Box, SpaceBetween, Link, ColumnLayout } from '@cloudscape-design/components';

interface MeterState {
    totalInputSpeechToken: number;
    totalInputTextToken: number;
    totalOutputSpeechToken: number;
    totalOutputTextToken: number;
    totalInputSpeechCost: number;
    totalInputTextCost: number;
    totalOutputSpeechCost: number;
    totalOutputTextCost: number;
    showMeterDetail: boolean;
    startTime: Date | null;
    elapsed: number;
    elapsedDisplay: string;
}

class Meter extends React.Component<{}, MeterState> {
    private sonicPrice: {
        inputSpeech: number;
        inputText: number;
        outputSpeech: number;
        outputText: number;
    };
    private intervalId: NodeJS.Timeout | null;

    constructor(props: {}) {
        super(props);
        this.state = {
            totalInputSpeechToken: 0,
            totalInputTextToken: 0,
            totalOutputSpeechToken: 0,
            totalOutputTextToken: 0,
            totalInputSpeechCost: 0,
            totalInputTextCost: 0,
            totalOutputSpeechCost: 0,
            totalOutputTextCost: 0,
            showMeterDetail: false,
            startTime: null,
            elapsed: 0,
            elapsedDisplay: "0s",
        };
        this.sonicPrice = {
            inputSpeech: 0.0034,
            inputText: 0.00006,
            outputSpeech: 0.0136,
            outputText: 0.00024
        };
        this.intervalId = null;
    }
        
    componentDidMount() {
        this.intervalId = setInterval(() => {
            if (this.state.startTime) {
                const elapsed = Date.now() - this.state.startTime.getTime();
                this.setState({ 
                    elapsed: elapsed,
                    elapsedDisplay: this.displayElapsed(elapsed)
                });
            }
        }, 500);
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    updateMeter(message: any) {
        if (message?.event?.usageEvent) {
            const usage = message.event.usageEvent;

            const input = usage.details?.total?.input;
            if (input) {
                if (input.speechTokens) {
                    this.setState({
                        totalInputSpeechToken: input.speechTokens,
                        totalInputSpeechCost: input.speechTokens/1000*this.sonicPrice.inputSpeech
                    });
                }
                if (input.textTokens) {
                    this.setState({
                        totalInputTextToken: input.textTokens,
                        totalInputTextCost: input.textTokens/1000*this.sonicPrice.inputText
                    });
                }
            }

            const output = usage.details?.total?.output;
            if (output) {
                if (output.speechTokens) {
                    this.setState({
                        totalOutputSpeechToken: output.speechTokens,
                        totalOutputSpeechCost: output.speechTokens/1000*this.sonicPrice.outputSpeech,
                    });
                }
                if (output.textTokens) {
                    this.setState({
                        totalOutputTextToken: output.textTokens,
                        totalOutputTextCost: output.textTokens/1000*this.sonicPrice.outputText
                    });
                }
            }
        }
    }

    formatCurrency(value: number, locale = 'en-US', currency = 'USD') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(value);
    }

    start() {
        this.cleanup();
        this.setState({startTime: new Date()});
    }

    stop() {
        this.setState({startTime: null});
    }

    cleanup() {
        this.setState({
            totalInputSpeechToken: 0,
            totalInputTextToken: 0,
            totalOutputSpeechToken: 0,
            totalOutputTextToken: 0,
            totalInputSpeechCost: 0,
            totalInputTextCost: 0,
            totalOutputSpeechCost: 0,
            totalOutputTextCost: 0,
            startTime: null,
            elapsed: 0,
            elapsedDisplay: "0s",
        });
    }

    displayElapsed(elapsed: number) {
        if (elapsed > 0) {
            const hours = Math.floor(elapsed / (1000 * 60 * 60));
            elapsed %= (1000 * 60 * 60);

            const minutes = Math.floor(elapsed / (1000 * 60));
            elapsed %= (1000 * 60);

            const seconds = Math.floor(elapsed / 1000);
            const milliseconds = elapsed % 1000;

            let parts = [];

            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0 || hours > 0) parts.push(`${minutes}m`); // show minutes if hours is shown

            parts.push(`${seconds}.${milliseconds}s`);

            return parts.join(' ');
        }
        return "0s";
    }

    render() {
        return (
            <div className="meter">
                <b>Session time</b>: {this.state.elapsedDisplay}<br/>
                <b>Total tokens</b>: {(this.state.totalInputSpeechToken + this.state.totalInputTextToken + this.state.totalOutputSpeechToken + this.state.totalOutputTextToken).toLocaleString()} 
                &nbsp; ({this.formatCurrency(this.state.totalInputTextCost + this.state.totalInputSpeechCost + this.state.totalOutputTextCost + this.state.totalOutputSpeechCost)})
                &nbsp;&nbsp;<Link onClick={()=>{this.setState({showMeterDetail: true})}}><Icon name="support" /></Link>
                <Modal
                    onDismiss={() => this.setState({showMeterDetail: false})}
                    visible={this.state.showMeterDetail}
                    header="Total tokens and cost"
                    size='large'
                    footer={
                        <div className='footer'>
                            Price per 1,000 tokens &nbsp;&nbsp;&nbsp; 
                            <Link
                                external
                                href="https://aws.amazon.com/bedrock/pricing/"
                                variant="primary"
                                >
                                Amazon Bedrock Pricing
                            </Link>
                            <div className='price'>
                                <div>
                                    Input Speech: ${this.sonicPrice.inputSpeech}
                                </div>
                                <div>
                                    Input Text: ${this.sonicPrice.inputText}
                                </div>
                                <div>
                                    Output Speech: ${this.sonicPrice.outputSpeech}
                                </div>
                                <div>
                                    Output Text: ${this.sonicPrice.outputText}      
                                </div>
                            </div>
                        </div>
                    }
                >
                    <div className='meterdetail'>
                        <ColumnLayout columns={2}>
                            <div>
                                Total: {(this.state.totalInputSpeechToken + this.state.totalInputTextToken + this.state.totalOutputSpeechToken + this.state.totalOutputTextToken).toLocaleString()}
                                &nbsp; ({this.formatCurrency(this.state.totalInputTextCost + this.state.totalInputSpeechCost + this.state.totalOutputTextCost + this.state.totalOutputSpeechCost)})
                            </div>
                            <div>
                                Total input: {(this.state.totalInputSpeechToken + this.state.totalInputTextToken).toLocaleString()} ({this.formatCurrency(this.state.totalInputTextCost + this.state.totalInputSpeechCost)})<br/>
                                Total output: {(this.state.totalOutputSpeechToken + this.state.totalOutputTextToken).toLocaleString()}  ({this.formatCurrency(this.state.totalOutputTextCost + this.state.totalOutputSpeechCost)})<br/>
                            </div>
                            <div>
                                Total input speech: {this.state.totalInputSpeechToken.toLocaleString()}
                            </div>
                            <div>
                                Total input text: {this.state.totalInputTextToken.toLocaleString()}
                            </div>
                            <div>
                                Total output speech: {this.state.totalOutputSpeechToken.toLocaleString()}
                            </div>
                            <div>
                                Total output text: {this.state.totalOutputTextToken.toLocaleString()}
                            </div>
                        </ColumnLayout>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default Meter; 