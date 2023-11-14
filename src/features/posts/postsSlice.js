import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BASE_URL = "https://twitter-api-yy1123.sigma-school-full-stack.repl.co";

//Async thunk for fetching a user's post
export const fetchPostsByUser = createAsyncThunk(
    "posts/fetchByUser",
    async(userId) => {
        const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
        return response.json(); //return posts from API
    }
);

export const savePost = createAsyncThunk(
    "posts/savePost",
    async (postContent) => {
        const token = localStorage.getItem("authToken");
        const decode = jwtDecode(token);
        const userId = decode.id;

        const data = {
            title: "Post Title",
            content: postContent,
            user_id: userId,
        };

        const response = await axios.post(`${BASE_URL}/posts`, data);
        return response.data;
    }
)

//slice
const postsSlice = createSlice({
    name: "posts",//state.posts.posts or loading
    initialState: {posts: [], loading: true, searchResults: []},
    reducers: {
        setSearchResults: (state, action) => {
            state.searchResults = action.payload;
        }
    },
    extraReducers: (builder) => { //dispatch> async thunk> extra reducer
        builder.addCase(fetchPostsByUser.fulfilled, (state, action) => {
            state.posts = action.payload;
            state.loading = false;
        }),
        builder.addCase(savePost.fulfilled, (state, action) => {
            state.posts = [action.payload, ...state.posts];
            //action payload = [{id:8 , title: post Title, content : post content , user_id: 5}]
            //..state.posts= [{id:1 , title: post Title, content : post content , user_id: 1}]

            //state.posts = [{id:8 , title: post Title, content : post content , user_id: 5}, {id:1 , title: post Title, content : post content , user_id: 1}]
        });
    },
});

export const {setSearchResults} = postsSlice.actions;
export default postsSlice.reducer;