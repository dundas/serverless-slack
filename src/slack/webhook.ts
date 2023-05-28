import axios from 'axios';
import qs from 'querystring';

export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body);
        console.log('Slack event', body);

        // Slack sends a verification challenge on app setup
        if (body.challenge) {
            return {
                statusCode: 200,
                body: JSON.stringify({ challenge: body.challenge })
            };
        }

        // Check the event type
        if (body.type === 'event_callback' && (body.event.type === 'message' || body.event.type === 'app_mention')) {
            // Check if the message is from the bot itself
            if (body.event.bot_id) {
                // Do not respond to the bot's own messages
                return {
                    statusCode: 200,
                    body: ''
                };
            }

            // Echo slack token 
            const token = process.env.SLACK_TOKEN; // Use environment variable for Slack token
            const channel = body.event.channel;
            const text = `Hello, <@${body.event.user}>! You said: ${body.event.text}`;

            // Send a message back to the channel
            const response = await axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                token: token,
                channel: channel,
                text: text
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Check if the request was successful
            if (response.data.ok) {
                return {
                    statusCode: 200,
                    body: ''
                };
            } else {
                console.error('Error posting message to Slack API', response.data);
                return {
                    statusCode: 500,
                    body: 'Error posting message to Slack API'
                };
            }
        }

        return {
            statusCode: 200,
            body: ''
        };
    } catch (err) {
        console.error('Error processing event', err);
        return {
            statusCode: 500,
            body: 'Error processing event'
        };
    }
};
