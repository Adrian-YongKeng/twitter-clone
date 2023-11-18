import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

//const BASE_URL = "https://twitter-api-yy1123.sigma-school-full-stack.repl.co";

//Async thunk for fetching a user's post
export const fetchPostsByUser = createAsyncThunk(
    "posts/fetchByUser",
    async(userId) => {
        try {
            const postsRef = collection(db, `users/${userId}/posts`);

            const querySnapshot = await getDocs(postsRef);
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            return docs;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const savePost = createAsyncThunk(
    "posts/savePost",
    async ({userId , postContent, file}) => {
        try {
            let imageUrl = "";

            console.log(file);
            if (file !== null) {
                const imageRef = ref(storage, `posts/${file.name}`);
                const response = await uploadBytes(imageRef, file);
                imageUrl = await getDownloadURL(response.ref);
            }

            const postsRef = collection(db, `users/${userId}/posts`);
            console.log(`users/${userId}/posts`);
            const newPostRef = doc(postsRef);
            console.log(postContent);
            await setDoc(newPostRef, { content : postContent, likes: [], imageUrl });
            const newPost = await getDoc(newPostRef);

            const post = {
                id: newPost.id,
                ...newPost.data(),
            };
            return post;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)

export const updatePost = createAsyncThunk(
    "posts/updatePost",
    async({userId, postId, newPostContent, newFile}) => {
        try {
            //upload the new file to the storage if it exists and get its URL 
            let newImageUrl;
            if (newFile) {
                const imageRef = ref(storage, `posts/${newFile.name}`);
                const response = await uploadBytes(imageRef, newFile);
                newImageUrl = await getDownloadURL(response.ref);
            }
            //reference to the exiting post
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            //get the current post data
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                //update the post content and the image url
                const updatedData = {
                    ...postData,
                    content: newPostContent || postData.content,
                    imageUrl: newImageUrl || postData.imageUrl,
                }
                //updtae the existing document in firestore
                await updateDoc(postRef, updatedData);
                //return the post with updated data
                const updatedPost = {id: postId, ...updatedData};
                return updatedPost;
            } else {
                throw new Error ("Post does not exist");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)

export const deletePost = createAsyncThunk(
    "posts/deletePost",
    async({userId, postId}) => {
        try {
            //reference to the  post
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            //delete the post 
            await deleteDoc(postRef);
            //return the Id of the deleted post
            return postId;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)

export const likePost = createAsyncThunk(
    "posts/likePost",
    async ({userId , postId}) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);

            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = [...postData.likes, userId];
                
                await setDoc(postRef, { ...postData, likes});
            }
            return {userId , postId};
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
)

export const removeLikeFromPost = createAsyncThunk(
    "posts/removeLikeFromPost",
    async ({userId , postId}) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);

            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = postData.likes.filter((id) => id !== userId);

                await setDoc(postRef, { ...postData, likes});
            }
            return {userId , postId};
        } catch (error) {
            console.error(error);
            throw error;
        }
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
        builder
            .addCase(fetchPostsByUser.fulfilled, (state, action) => {
            state.posts = action.payload;
            state.loading = false;
            })
            .addCase(savePost.fulfilled, (state, action) => {
            state.posts = [action.payload, ...state.posts];
            //action payload = [{id:8 , title: post Title, content : post content , user_id: 5}]
            //..state.posts= [{id:1 , title: post Title, content : post content , user_id: 1}]

            //state.posts = [{id:8 , title: post Title, content : post content , user_id: 5}, {id:1 , title: post Title, content : post content , user_id: 1}]
            })
            .addCase(likePost.fulfilled, (state,action) => {
                const {userId, postId} = action.payload;

                const postIndex =state.posts.findIndex((post) => post.id === postId);

                if (postIndex !== -1) {
                    state.posts[postIndex].likes.push(userId);
                }
            })
            .addCase(removeLikeFromPost.fulfilled, (state,action) => {
                const {userId, postId} = action.payload;

                const postIndex =state.posts.findIndex((post) => post.id === postId);

                if (postIndex !== -1) {
                    state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
                        (id) => id !== userId
                    );
                }
            })
            .addCase(updatePost.fulfilled, (state,action) => {
                const updatePost = action.payload;
                //find and updtae the post in the state
                const postIndex =state.posts.findIndex(
                    (post) => post.id === updatePost.id
                );
                if (postIndex !== -1) {
                    state.posts[postIndex] = updatePost;
                }
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                const deletedPostId = action.payload;
                //filter the deletedpost from the state
                state.posts = state.posts.filter((post) => post.id !== deletedPostId);
            })
    },
});

export const {setSearchResults} = postsSlice.actions;
export default postsSlice.reducer;