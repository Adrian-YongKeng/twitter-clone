import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchResults } from "../features/posts/postsSlice";


export default function SearchBar() {
    const [searchTerm , setSearchTerm] = useState("");
    const dispatch =useDispatch();
    const posts = useSelector((state) => state.posts.posts);

    const handleSearch = () => {
        const filteredResults = posts.filter((post) =>
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        dispatch(setSearchResults(filteredResults));
    }
    const clearSearch = () => {
        setSearchTerm("");
        dispatch(setSearchResults([]));
    }

        return (
            <div className="input-group">
            <input
                type="text"
                className="form-control"
                placeholder="Search tweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                    <i className="bi bi-search"></i>
                </button>
                {searchTerm && (
                    <button className="btn btn-outline-secondary" type="button" onClick={clearSearch}>
                        <i className="bi bi-x"></i>
                    </button>
                )}
            </div>
        </div>
            
        );
    }
