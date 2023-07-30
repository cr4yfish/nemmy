"use client";

import { PostView } from "lemmy-js-client";
import React, { createContext, useContext, useState } from "react";

interface PostContextProps {
  post: PostView | undefined;
  setPost: React.Dispatch<React.SetStateAction<PostView | undefined>>;
}

const PostContext = createContext<PostContextProps>({
  post: undefined,
  setPost: () => {},
});

export const PostContextProvider = ({ children }: { children: any }) => {
  const [post, setPost] = useState<PostView | undefined>(undefined);

  return (
    <PostContext.Provider value={{ post, setPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
