'use client';
import axios from 'axios';
import React from 'react';

async function postPrompt(prompt: string): Promise<string> {
    const res = await axios.post('/api/prompt', prompt, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    return JSON.stringify(res.data).replace(/\\n/g, '\n').replace('"', ''); // Format response: fix line breaks and quotation marks
}
export default function Home() {
    const [results, setResults] = React.useState(['']);
    const [prompt, setPrompt] = React.useState('');

    async function sendPrompt() {
        const promptResult = await postPrompt(prompt);
        setResults([...results, prompt, promptResult]);
    }

    function populateChat() {
        const chatElements: Array<JSX.Element> = [
            <p key="answer-0-text" className="flex answer w-full">
                Hello, ask me a question!
            </p>,
            <br key="answer-0-break" />,
        ];
        results.forEach((result, index) => {
            if (result !== '') {
                const textClass =
                    index % 2 == 0 ? 'text-emerald-500' : 'text-white';
                const paragraphEle = (
                    <p
                        key={`${textClass}-${index}-text`}
                        className={`flex ${textClass} w-full`}
                    >
                        {result}
                    </p>
                );
                chatElements.push(paragraphEle);
                chatElements.push(<br key={`${textClass}-${index}-break`} />);
            }
        });
        return chatElements;
    }
    return (
        <main className="flex min-h-screen w-screen flex-col items-center justify-between p-24">
            <div className="flex flex-col block h-[20rem] overflow-auto w-full p-2.5 m-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 whitespace-pre-wrap">
                {populateChat()}
            </div>

            <div className="flex h-10 w-full">
                <input
                    className="shadow appearance-none border rounded h-full w-96 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.currentTarget.value);
                    }}
                />
                <button className="w-4" onClick={sendPrompt}>
                    Send
                </button>
            </div>
        </main>
    );
}
