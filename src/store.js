import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./features/posts/postsSlice";
import commentsReducer from "./features/posts/commentsSlice"

export default configureStore({
    reducer: {
        posts: postsReducer,
        comments: commentsReducer
    },
})