"use client";

import { Card, Title, BarList, Subtitle } from "@tremor/react"
import { PostView } from "lemmy-js-client";

import RenderMarkdown from "./ui/RenderMarkdown"

export default function Poll({ post } : { post: PostView }) {

    return (
        <>
        <Card>
            <Title>
                <RenderMarkdown content={post.post.name.replace("[POLL]", "")} />
            </Title>
            <Subtitle>Vote by upvoting/downvoting</Subtitle>
            <BarList
            data={[
                {
                    name: "Yes",
                    value: post.counts.upvotes,
                },
                {
                    name: "No",
                    value: post.counts.downvotes,
                }
            ]}
            />
        </Card>
        </>
    )
}