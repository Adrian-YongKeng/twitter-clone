import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
//import axios from "axios";

const BASE_URL = "https://twitter-api-yy1123.sigma-school-full-stack.repl.co";

export const fetchComments = createAsyncThunk(
    'comments/fetchComments', 
    async(postId) => {
        const response = await fetch(`${BASE_URL}/comments/${postId}`);
        const comments = await response.json();
        return { postId, comments }; // Return both postId and comments
    });
//addcomment
export const addComment = createAsyncThunk(
    "comments/addComment",
    async({postId, content, userId}) => {
        const response = await fetch(`${BASE_URL}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: postId, content, user_id: userId }),
          });
        const newComment = await response.json();
        return { postId, comment: newComment }; // Return both postId and the new comment
});

//edit comment thunk
export const editComment = createAsyncThunk (
    "comments/editComment",
    async({commentId, content }) => {
        const response = await fetch (`${BASE_URL}/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        })
        const updatedComment = await response.json();
        return { commentId, updatedComment }; // Return both commentId and the updated comment
    }
)

//delete comment Thunk
export const deleteComment = createAsyncThunk(
    "comments/deleteComment",
    async(commentId) => {
        await fetch(`${BASE_URL}/comments/${commentId}`, { 
            method: 'DELETE' 
        });
        return commentId; // Return the id of the deleted comment
    }
)


const commentsSlice = createSlice({
    name: 'comments',
    initialState: {
        byPostId: [],
        loading: false,
        error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchComments.pending, (state) =>{
            state.loading = true;
        })
        .addCase(fetchComments.fulfilled, (state,action) => {
            //state.loading = false;
            const { postId, comments } = action.payload;
            state.byPostId[postId] = comments; //"Give me the array of comments that belong to the post with this specific ID."
        })
        .addCase(addComment.fulfilled, (state, action) => {
            const { postId, comment } = action.payload;
            if (!state.byPostId[postId]) {
                state.byPostId[postId] = [];
            }
            state.byPostId[postId].push(comment);
        })
        .addCase(editComment.fulfilled, (state, action) => {
            const { commentId, updatedComment } = action.payload;
            const postId = updatedComment.post_id; 
            if (state.byPostId[postId]) {
                const index = state.byPostId[postId].findIndex(comment => comment.id === commentId);
                if (index !== -1) {
                    state.byPostId[postId][index] = updatedComment;
                }
            }
        })
        
        .addCase(deleteComment.fulfilled, (state, action) => {
            const commentId = action.payload;
            Object.values(state.byPostId).forEach(comments => {
                const commentIndex = comments.findIndex(c => c.id === commentId);
                if (commentIndex !== -1) {
                    comments.splice(commentIndex, 1);
                }
            })
        })
  }
})

export default commentsSlice.reducer

