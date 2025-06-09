"use client";
import React, { useState, useEffect } from "react";
import { MessageType } from "@/types/message";
import { useSelector, useDispatch } from "react-redux";
import { deleteMessage, updateMessage } from "@/app/redux/slices/messagesSlice";
import {
  addUserReaction,
  updateComment,
  deleteComment,
} from "@/app/redux/slices/commentsSlice";
import { User } from "@/types/user";
import ModalEditMessage from "@/components/ModalEditMessage/ModalEditMessage";
import Image from "next/image";
import Tab from "@/components/ui/Tab/Tab";
import ModalAddComment from "@/components/ModalAddComment/ModalAddComment";
import Loading from "@/components/ui/Loading/Loading";

import dynamic from "next/dynamic";
import MessageComments from "../MessageComments/MessageComments";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

interface MessageProps {
  msg: MessageType;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const dispatch = useDispatch();
  const user: User | null = useSelector((state: any) => state.auth.user);
  const socket: any = useSelector((state: any) => state.socket.socket);
  const comments = useSelector((state) => state.comments.comments);
  const usersLikedDisliked = useSelector(
    (state) => state.messages.usersLikedDisliked
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [usersLiked, setusersLiked] = useState<number[]>([]);
  const [usersDisliked, setusersDisliked] = useState<number[]>([]);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ------------------------------
  useEffect(() => {
    if (usersLikedDisliked) {
      setusersLiked(
        usersLikedDisliked
          .filter((reaction: any) => reaction.messageId === msg.id)
          .filter((reaction: any) => reaction.reaction === "like")
          .map((reaction: any) => reaction.userName)
      );
      setusersDisliked(
        usersLikedDisliked
          .filter((reaction: any) => reaction.messageId === msg.id)
          .filter((reaction: any) => reaction.reaction === "dislike")
          .map((reaction: any) => reaction.userName)
      );
    }
  }, [usersLikedDisliked]);

  useEffect(() => {
    if (user && user?.userName === msg?.author) {
      setIsAuthor(true);
    } else {
      setIsAuthor(false);
    }
  }, [user, msg]);

  useEffect(() => {
    if (socket) {
      const handleMessageLiked = (
        likedMessage: MessageType,
        userId: number
      ) => {
        setIsLoading(false);
        if (likedMessage.id === msg.id) {
          dispatch(updateMessage(likedMessage));
        }
      };
      const handleMessageDisliked = (
        dislikedMessage: MessageType,
        userId: number
      ) => {
        setIsLoading(false);
        if (dislikedMessage.id === msg.id) {
          dispatch(updateMessage(dislikedMessage));
        }
      };

      const handleMessageDeleted = (deletedMessage: MessageType) => {
        dispatch(deleteMessage(deletedMessage.id));
        console.log('<===="Message deleted successfully."====>');
        setSuccessMessage("Message deleted successfully.");

        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
      };

      const handleDeliteComment = (data: any) => {
        setSuccessMessage("Comment deleted successfully.");
        setIsLoading(false);
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
        dispatch(deleteComment(data.commentId));
      };
      const handleUpdateComment = (updatedComment: MessageType) => {
        console.log("<====comment updated====>", updatedComment);
        setIsLoading(false);
        dispatch(updateComment(updatedComment));
      };
      // -----------------------

      socket.on("message_liked", handleMessageLiked);
      socket.on("message_disliked", handleMessageDisliked);
      socket.on("users_liked_disliked", () => {
        setIsLoading(false);
      });
      socket.on("message_deleted", handleMessageDeleted);

      socket.on("comment_updated", handleUpdateComment);
      socket.on("comment_deleted", handleDeliteComment);

      socket.on("error", (error: any) => {
        console.error("Socket error:", error);
        setIsLoading(false);
        setSuccessMessage(error.message);
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
      });

      return () => {
        socket.off("message_liked", handleMessageLiked);
        socket.off("message_disliked", handleMessageDisliked);
        socket.off("message_deleted", handleMessageDeleted);
        socket.off("comment_updated", handleUpdateComment);
        socket.off("comment_deleted", handleDeliteComment);
      };
    }
  }, [socket, dispatch, msg.id]);
  // -------------------------
  // -------------------------
  // -------------------------
  const handleLike = (id: number) => {
    if (socket && user?._id) {
      setIsLoading(true);
      socket.emit("like_message", {
        messageId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
      if (!usersLiked.includes(user?.userName)) {
        setusersLiked((prev) => [...prev, user?.userName]);
      } else {
        setSuccessMessage("You already liked this message.");
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
      }
      setusersDisliked((prev) => prev.filter((id) => id !== user?.userName));
    } else {
      setSuccessMessage("Login to like this message.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
  };

  const handleDisLike = (id: number) => {
    if (socket && user?._id) {
      setIsLoading(true);
      socket.emit("dislike_message", {
        messageId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
      if (!usersDisliked.includes(user?.userName)) {
        setusersDisliked((prev) => [...prev, user?.userName]);
      } else {
        setSuccessMessage("You already disliked this message.");
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
      }

      setusersLiked((prev) => prev.filter((id) => id !== user?.userName));
    } else {
      setSuccessMessage("Login to dislike this message.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
  };
  // ------------comments----------------
  const handleCommentLike = (id: number) => {
    if (socket && user?._id) {
      setIsLoading(true);
      socket.emit("like_comment", {
        commentId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
    } else {
      setSuccessMessage("Login to like this comment.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
  };
  const handleCommentDislike = (id: number) => {
    if (socket && user?._id) {
      setIsLoading(true);
      socket.emit("dislike_comment", {
        commentId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
    } else {
      setSuccessMessage("Login to dislike this comment.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
  };

  // -------------!!!!!!!!!!!!---------------
  const handleDelete = (id: number) => {
    if (socket) {
      socket.emit("delete_message", {
        id: Number(id),
      });
    }
  };
  // -------------!!!!!!!!!!!!---------------
  const handleCommentDelete = (id: number) => {
    if (socket) {
      socket.emit("delete_comment", {
        commentId: Number(id),
        userId: user?._id,
      });
    }
  };
  // ----------------------------
  return (
    <div>
      {isLoading && <Loading></Loading>}
      <div className="flex justify-between items-start ">
        <span className="text-gray-500 text-xs">id:{msg?.id}</span>
        <span className="text-gray-500 text-xs">author:{msg?.author}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {new Date(msg.createdAt).toLocaleString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isAuthor && (
            <div className="flex gap-2">
              <Image
                src="/assets/svg/edit.svg"
                width={15}
                height={15}
                alt="edit"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer hover:scale-110 transition-transform duration-150"
              />
              <Image
                src="/assets/svg/cross.svg"
                width={15}
                height={15}
                alt="delete"
                className="cursor-pointer hover:scale-110 transition-transform duration-150"
                onClick={() => handleDelete(msg.id)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
        <p className="text-gray-800 leading-none">{msg.text}</p>
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-[1fr_25px] items-center gap-2">
            <Image
              src="/assets/svg/like.svg"
              width={15}
              height={15}
              alt="like"
              className="object-cover cursor-pointer"
              onClick={() => handleLike(msg.id)}
            />{" "}
            <Tab length={usersLiked.length} details={usersLiked} />
          </div>

          <div className="grid grid-cols-[1fr_25px] items-center gap-2">
            <div className="rotate-[180deg]">
              <Image
                src="/assets/svg/like.svg"
                width={15}
                height={15}
                alt="dislike"
                className="object-cover cursor-pointer"
                onClick={() => handleDisLike(msg.id)}
              />
            </div>
            <Tab length={usersDisliked.length} details={usersDisliked} />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-6 text-[10px] text-gray-500 leading-none border border-gray-400 rounded-md p-1 hover:bg-gray-300 transition-colors duration-150 cursor-pointer ml-3"
        onClick={() => {
          if (user) {
            setIsModalCommentOpen(true);
          } else {
            setSuccessMessage("Login to comment this message.");
            setOpenModalMessage(true);
            setIsModalVisible(true);
            setTimeout(() => {
              setOpenModalMessage(false);
              setSuccessMessage("");
            }, 2000);
          }
        }}
      >
        Add comment
      </button>

      {/* ===========comments============= */}
      <MessageComments
        user={user}
        comments={comments}
        handleCommentDislike={handleCommentDislike}
        handleCommentLike={handleCommentLike}
        handleCommentDelete={handleCommentDelete}
        msg={msg}
      />
      {/* <div>
        {comments
          .filter((comment) => comment.messageId === msg.id)
          .map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-400 rounded-md mt-2 p-2 ml-3 "
            >
              <div className="flex items-center gap-2 ">
                <p className="text-gray-400 text-[12px] leading-none ">
                  {comment.userName}
                </p>
                <Image
                  src="/assets/svg/like.svg"
                  width={15}
                  height={15}
                  alt="dislike"
                  className="object-cover cursor-pointer ml-auto"
                  onClick={() => {
                    handleCommentLike(comment.id);
                  }}
                />
                <span>{comment.likes}</span>
                <div className="transform rotate-[180deg]">
                  <Image
                    src="/assets/svg/like.svg"
                    width={15}
                    height={15}
                    alt="dislike"
                    className="object-cover cursor-pointer"
                    onClick={() => {
                      handleCommentDislike(comment.id);
                    }}
                  />
                </div>
                <span>{comment.dislikes}</span>
                {user && Number(user?._id) === comment?.userId && (
                  <Image
                    src="/assets/svg/cross.svg"
                    width={15}
                    height={15}
                    alt="delete"
                    className="cursor-pointer hover:scale-110 transition-transform duration-150"
                    onClick={() => handleCommentDelete(comment.id)}
                  />
                )}
              </div>

              <p className="text-gray-600 leading-none">{comment.text}</p>
            </div>
          ))}
      </div> */}

      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      {isModalOpen && (
        <ModalEditMessage message={msg} onClose={() => setIsModalOpen(false)} />
      )}
      {isModalCommentOpen && (
        <ModalAddComment
          messageId={msg.id}
          onClose={() => setIsModalCommentOpen(false)}
        />
      )}
    </div>
  );
};

export default Message;
