import React from 'react';
import MarkDown from "../MarkDown";
import { Clock } from "lucide-react";

// Calculate reading time for a single topic
const calculateTopicReadingTime = (topic) => {
    if (!topic || !topic.content) return 1;

    let text = topic.title || "";

    if (Array.isArray(topic.content)) {
        topic.content.forEach(item => {
            if (typeof item.content === "string") {
                text += " " + item.content;
            } else if (Array.isArray(item.content)) {
                text += " " + item.content.join(" ");
            }
        });
    }

    // Remove HTML tags and count words
    const cleanText = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const wordCount = cleanText.split(" ").filter(word => word.length > 0).length;

    // 200 words per minute
    return Math.max(1, Math.ceil(wordCount / 200));
};

const Content = ({ currentTopic }) => {
    const readingTime = calculateTopicReadingTime(currentTopic);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">{currentTopic.title}</h2>
                <div className="flex items-center gap-1.5 text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                        {readingTime} min read
                    </span>
                </div>
            </div>
            <div className="text-lg">
                {currentTopic.content?.map((item, index) => {
                    switch (item.type) {
                        case "header1":
                            return (
                                <h2
                                    key={index}
                                    className="text-3xl font-bold mt-6 mb-3"
                                >
                                    {item.content}
                                </h2>
                            );
                        case "header2":
                            return (
                                <h2
                                    key={index}
                                    className="text-2xl font-bold mt-6 mb-3"
                                >
                                    {item.content}
                                </h2>
                            );
                        case "header3":
                            return (
                                <h2
                                    key={index}
                                    className="text-xl font-bold mt-6 mb-3"
                                >
                                    {item.content}
                                </h2>
                            );
                        case "para":
                            return (
                                <div
                                    key={index}
                                    className="mb-4 leading-relaxed"
                                >
                                    <MarkDown content={item.content} />
                                </div>
                            );
                        case "code":
                            return (
                                <MarkDown
                                    key={index}
                                    content={item.content}
                                ></MarkDown>
                            );
                        case "points":
                            return (
                                <ul
                                    key={index}
                                    className="list-disc pl-6 mb-4 space-y-2"
                                >
                                    {Array.isArray(item.content) &&
                                        item.content.map((point, i) => (
                                            <li
                                                key={i}
                                                className="leading-relaxed"
                                            >
                                                <MarkDown content={point} />
                                            </li>
                                        ))}
                                </ul>
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
};

export default Content;
