import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Button, Col, Form, Image, Modal, Row } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux";
import { addComment, deleteComment, editComment, fetchComments} from "../features/posts/commentsSlice";


export default function ProfilePostCard ({content, postId}) {
    const [likes, setLikes] = useState([]);
    //const [showModal, setShowModal] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [selectedComment, setSelectedComment] = useState("");
    const [showAddCommentModal, setShowAddCommentModal] = useState(false);
    const [showEditDeleteModal, setShowEditDeleteModal] = useState(false);


    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.byPostId[postId] || []);

    const token = localStorage.getItem("authToken");
    const decode = jwtDecode(token);
    const userId = decode.id;

    const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg"
    const BASE_URL = "https://twitter-api-yy1123.sigma-school-full-stack.repl.co";

    useEffect(() => {
        fetch(`${BASE_URL}/likes/post/${postId}`)
        .then((response) => response.json())
        .then((data) => setLikes(data))
        .catch((error) => console.error("Error:", error))
    }, [postId]);
    //determine whether the post like by user or not
    const isLiked = likes.some((like) => like.user_id === userId);
    //determine which function to run , depending on whether user has liked the post
    const handleLike = () => (isLiked? removeFromLikes() : addToLikes());

    const addToLikes = () => {
        axios.post(`${BASE_URL}/likes`, {
            user_id: userId,
            post_id: postId,
        })
        .then((response) => {
            setLikes([...likes, {...response.data, likes_id: response.data.id}]);
        })
        .catch((error) => console.error("Error:", error))
    }

    const removeFromLikes = () => {
        const like = likes.find((like) => like.user_id ===userId);
        if (like) {
            axios
            .put(`${BASE_URL}/likes/${userId}/${postId}`)
            .then(() => {
                setLikes(likes.filter((likeItem) => likeItem.user_id !== userId));
            })
            .catch((error) => console.error("Error:", error))
        }
    }

    useEffect(() => {
        dispatch(fetchComments(postId))
        .then((result) => {
            // Handle successful fetch
            console.log("Comments fetched successfully:", result);
        })
        .catch((error) => {
            // Handle fetch error
            console.error("Error fetching comments:", error);
        });
      }, [dispatch, postId]);

   

    const handleAddComment = () => {
        dispatch(addComment({ postId, content: newCommentContent, userId }))
        .then(() => {
            setNewCommentContent("");
            setShowAddCommentModal(false);
        })
        .catch((error) => {
            console.error("Error adding comment:", error);
        });
    };

    const openEditDeleteModal = (comment) => {
        setSelectedComment(comment);
        setShowEditDeleteModal(true);
    };
    const handleEditComment = (commentId, updatedContent) => {
        dispatch(editComment({commentId, content:updatedContent}))
        .then(() => {
            console.log("Comment edited successfully");
            setShowEditDeleteModal(false);
            dispatch(fetchComments(postId)) //refetch comment
          })
          .catch((error) => console.error("Error editing comment:", error));
    }

    const handleDeleteComment = (commentId) => {
        dispatch(deleteComment(commentId))
        .then(() => {
            console.log("Comment deleted successfully");
            setShowEditDeleteModal(false);
           // dispatch(fetchComments(postId))
          })
          .catch((error) => console.error("Error deleting comment:", error));
    }

    return (
        <Row
            className="p-3"
            style={{
                borderTop: "1px solid #D3D3D3",
                borderBottom: "1px solid #D3D3D3"
            }}
        >
            <Col sm={1}>
                <Image src={pic} fluid roundedCircle/>
            </Col>

            <Col>
                <strong>Haris</strong>
                <span>@haris.smaingan · Apr 16</span>
                <p>{content} </p>
                <div>
                    <h6>Comments:</h6>
                    {comments.length > 0 && comments.map((comment) => (
                        <div key={comment.id}>
                            <p>{comment.content}  
                                <Button variant="light" className="ms-3" onClick={() => openEditDeleteModal(comment)}>
                                    <i className="bi bi-pencil-square" ></i> 
                                </Button>
                            </p>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-between">
                    <Button variant="light" onClick={() => setShowAddCommentModal(true)}>
                        <i className="bi bi-chat"></i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-repeat"></i>
                    </Button>
                    <Button variant="light" onClick={handleLike}>
                        {isLiked ? (
                            <i className="bi bi-heart-fill text-danger"></i>
                        ) : (
                            <i className="bi bi-heart"></i>
                        )}
                         {likes.length}
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-graph-up"></i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-upload"></i>
                    </Button>
                </div>
            </Col>
            <Modal show={showAddCommentModal} onHide={() => setShowAddCommentModal(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Add Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group controlId="commentForm">
                    <Form.Label>Your Comment</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                    />
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleAddComment}>
                    Add Comment
                </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditDeleteModal} onHide={() => setShowEditDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit/Delete Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                    <Form.Group controlId="commentForm">
                        <Form.Label>Edit Comment</Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={3}
                        value={selectedComment ? selectedComment.content : ''}
                        onChange={(e) => setSelectedComment({ ...selectedComment, content: e.target.value })}
                        />
                    </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => handleDeleteComment(selectedComment.id)}>
                    Delete
                    </Button>
                    <Button variant="primary" onClick={() => handleEditComment(selectedComment.id, selectedComment.content)}>
                    Save Changes
                    </Button>
                </Modal.Footer>
                </Modal>
        </Row>
    )
}