/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { z } from "zod";
import axios from "axios";
import Image from "next/image";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import Timeago from "react-timeago";
import { useEffect, useState, useRef, ElementRef } from "react";
import { Message, useAuthContext } from "../auth-provider";
import cirlceWrapper from "@/public/logoWrapper.svg";
import Head from "next/head";
import logo from "@/public/logo.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChatSocket } from "../api/chat/useChatSocket";
import { useChatScroll } from "./useChatScroll";
// import VideoButton from "./VideoButton";
import { useSearchParams } from "next/navigation";
// import Video from "./Video";

type User = {
  id: string;
  username: string;
  picture: string;
};

const messageSchema = z.object({
  message: z.string().min(1),
});

type ChatForm = z.infer<typeof messageSchema>;

const Chat = () => {
  const {
    username,
    id: currentUserId,
    messages,
    setUsername,
    setMessages,
  } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [currentChat, setCurrentChat] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [oppositeParticipant, setOppositeParticipant] = useState<{
    username: string | null;
  }>({ username: null });
  const [showUsersPanel, setShowUsersPanel] = useState(true);
  const bottomRef = useRef<ElementRef<"div">>(null);
  const modalRef = useRef<ElementRef<"dialog">>(null);
  const searchParms = useSearchParams();
  const video = searchParms?.get("video");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<ChatForm>({
    resolver: zodResolver(messageSchema),
  });

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.get("/api/logout");
      setUsername("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  const deleteAccount = async () => {
    try {
      setIsDeletingUser(true);
      await axios.delete("/api/delete-account", {
        data: { username },
      });
      modalRef?.current?.close();
      setUsername("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(`/api/messages?chatID=${currentChat}`, data);
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      reset();
    }
  });

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios("/api/users");
      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessages = async () => {
    try {
      const { data } = await axios.get(`/api/message?chatID=${currentChat}`);
      setMessages(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleChatClick = async (
    participantOneId: string,
    participantTwoId: string
  ) => {
    try {
      setCurrentUser(participantTwoId);
      setIsChatLoading(true);
      setIsMessagesLoading(true);
      const { data: chat } = await axios.post("/api/chat", {
        participantOneId,
        participantTwoId,
      });

      setCurrentChat(chat.id);
      const { participantOne, participantTwo } = chat;
      const other =
        participantOne.id === currentUserId ? participantTwo : participantOne;
      setOppositeParticipant(other);
      setShowUsersPanel(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (currentChat) {
      getMessages();
    }
  }, [currentChat]);

  const chatKey = `chat:${currentChat}:messages`;

  useChatSocket(chatKey);
  useChatScroll({ bottomRef });

  let previousDate: string;

  return (
    <>
      <Head>
        <title>Dialogue with {oppositeParticipant.username}</title>
        <meta
          name="description"
          content="Join and chat with end-to-end communication."
        />
        {/* Other meta tags */}
      </Head>
      <div
        className={classNames("grid ", {
          "md:grid-cols-[minmax(20rem,32%),auto]": !video,
        })}
      >
        {/* left side */}
        {!video && (
          <div
            className={classNames(
              "flex-col gap-3 h-screen flex p-3 bg-base-200 md:border-r border-base-300 md:shadow-sm",
              {
                "hidden md:flex": !showUsersPanel,
              }
            )}
          >
            <div className="flex justify-between items-center glass rounded-btn p-3 bg-base-300">
              <div
                className={`relative w-fit capitalize text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-orange-400 font-extrabold text-2xl`}
              >
                <span className="p-2 inline-block ">Dialogue</span>
                <Image
                  src={cirlceWrapper}
                  className="absolute left-0 top-0 h-full w-full"
                  alt="circle"
                />
              </div>
              <div>
                <div className="dropdown  dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-sm btn-circle btn-ghost cursor-pointer p-1 m-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-5 h-5 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      ></path>
                    </svg>
                  </label>
                  <div
                    tabIndex={0}
                    className="flex flex-col-reverse gap-2 dropdown-content z-[1] menu p-2 shadow bg-base-300 glass rounded-btn w-40"
                  >
                    <span
                      className="btn btn-sm btn-ghost text-primary text-sm w-full font-semibold"
                      onClick={() => modalRef?.current?.showModal()}
                    >
                      Delete Account
                    </span>
                    <dialog className="modal" ref={modalRef}>
                      <div className="modal-box">
                        <form method="dialog">
                          {/* if there is a button in form, it will close the modal */}
                          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                          </button>
                        </form>
                        <h3 className="font-bold text-lg capitalize">
                          Your friends will miss you!
                        </h3>
                        <p className="py-4">
                          Are you sure you want to delete your account?
                        </p>
                        <div className="modal-action mt-0">
                          {/* if there is a button in form, it will close the modal */}
                          <span
                            className={classNames(
                              "btn btn-sm  btn-ghost text-primary text-sm  font-semibold",
                              { "btn-disabled": isDeletingUser }
                            )}
                            onClick={deleteAccount}
                          >
                            {isDeletingUser ? "Deleting" : "Delete"}
                          </span>
                        </div>
                      </div>
                    </dialog>
                    <span
                      className={classNames(
                        "btn btn-sm btn-ghost text-primary text-sm w-full font-semibold",
                        { "btn-disabled": isLoggingOut }
                      )}
                      onClick={logout}
                    >
                      <a>{isLoggingOut ? "Logging out" : "Logout"}</a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 md:order-1 h-full border border-base-100 rounded-btn overflow-hidden">
              <h2 className="h-12 text-xl font-semibold border-b border-base-300 p-3">
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent cursor-pointer"
                  onClick={() => {
                    setCurrentChat("");
                    setCurrentUser("");
                  }}
                >
                  Chats
                </span>
              </h2>
              <div className=" h-[calc(100%-3rem)] overflow-auto scrollbar-thumb-base-content scrollbar-track-base-300 scrollbar-thin scrollbar-track-rounded-md scrollbar-thumb-rounded-md">
                <div>
                  {isLoading &&
                    new Array(7).fill(0).map((user, index) => (
                      <div
                        key={`${user}-${index}`}
                        className="flex gap-2 items-center p-3"
                      >
                        <div className="skeleton w-8 h-8 mask mask-squircle"></div>
                        <div className="flex flex-col gap-4">
                          <div className="skeleton h-2 w-52"></div>
                        </div>
                      </div>
                    ))}
                  {!isLoading &&
                    users.map((user) => {
                      return (
                        <div
                          key={user.id}
                          className={classNames(
                            "hover:bg-base-300  hover:border-none hover:glass p-3 cursor-pointer border-b last:border-b-0 border-base-100  font-semibold",
                            {
                              "bg-base-300 glass border-none":
                                currentUser == user.id,
                            }
                          )}
                          onClick={() =>
                            handleChatClick(`${currentUserId}`, user.id)
                          }
                        >
                          <div className="flex items-center gap-4">
                            <div className="avatar placeholder ">
                              <div
                                className={
                                  "w-10 bg-base-300 text-base-content glass mask mask-circle"
                                }
                              >
                                <span
                                  className={classNames(
                                    "text-xl uppercase font-semibold text-center",
                                    {
                                      "text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent":
                                        currentUser == user.id,
                                    }
                                  )}
                                >
                                  {user.username.substring(0, 1)}
                                </span>
                              </div>
                            </div>
                            <div
                              className={classNames({
                                "text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent":
                                  currentUser == user.id,
                              })}
                            >
                              {user.username}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 rounded-btn border border-base-100 p-2 flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent text-xl font-bold flex-1">
                Welcome {username}
              </span>
              <label className="flex justify-center cursor-pointer gap-2">
                <span className="label-text">Dark</span>
                <input
                  type="checkbox"
                  value="fantasy"
                  className="toggle theme-controller"
                />
                <span className="label-text">Light</span>
              </label>
            </div>
          </div>
        )}

        {/* right side */}
        <div
          className={classNames("flex flex-col h-screen  text-sm", {
            "justify-center items-center": !currentChat || isMessagesLoading,
            "hidden md:flex": showUsersPanel,
          })}
        >
          {/* loading when retrieving chatts */}
          <span
            className={classNames(
              "loading loading-infinity loading-lg text-primary",
              {
                "hidden ": isChatLoading || !isMessagesLoading,
              }
            )}
          />
          <div
            className={classNames(
              "glass bg-base-300 p-2 gap-3 flex items-center ",
              {
                "hidden ":
                  !currentChat ||
                  (currentChat && isMessagesLoading) ||
                  (!currentChat && messages.length === 0),
              }
            )}
          >
            <span
              className={" text-2xl btn btn-sm btn-ghost md:hidden"}
              onClick={() => setShowUsersPanel(true)}
            >
              ❮
            </span>
            <div className="flex flex-1 items-center gap-4">
              <div className="avatar placeholder">
                <div
                  className={
                    "rounded-full w-8 bg-base-300 text-base-content glass"
                  }
                >
                  <span className="text-xl uppercase font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                    {oppositeParticipant?.username?.substring(0, 1)}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                {oppositeParticipant?.username}
              </div>
            </div>
            {/* <VideoButton /> */}
          </div>

          <div
            className={classNames("flex flex-col items-center justify-center", {
              "hidden ": !!currentChat,
            })}
          >
            <div>
              <Image src={logo} alt="logo" className="max-w-[10rem] h-auto" />
            </div>
            <div className=" text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent  text-center   text-2xl">
              &copy;<code className="font-extrabold">Cherubln.</code>
              <div className="dropdown dropdown-hover dropdown-end text-base-content">
                <label
                  tabIndex={0}
                  className="btn btn-circle btn-ghost btn-xs text-base-content"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </label>
                <div
                  tabIndex={0}
                  className="card compact dropdown-content z-[1] shadow bg-base-200 rounded-box w-64"
                >
                  <div className="card-body">
                    <p>
                      Hi 👋 there, I am Cherubin. I built this
                      &ldquo;Dialogue&rdquo; App. Find more at my
                      <span className="hover:underline">
                        <a
                          href="https://github.com/Cherubln"
                          target="_blank"
                          className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent hover:underline ml-1"
                        >
                          Github page
                        </a>
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <span
              className={classNames(
                "loading loading-infinity loading-lg text-primary opacity-0",
                { "opacity-100 ": isChatLoading }
              )}
            ></span>
          </div>
          <div
            className={classNames("flex-1 px-5 items-end", {
              "flex ": currentChat && messages?.length === 0,
              "hidden ":
                !currentChat ||
                isMessagesLoading ||
                (currentChat && messages?.length !== 0),
            })}
          >
            <div className="flex flex-col gap-2 mb-5">
              <div>
                <div className="chat-image avatar placeholder">
                  <div
                    className={
                      "rounded-full w-20 bg-base-300 text-base-content glass"
                    }
                  >
                    <span className="text-5xl uppercase font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                      {oppositeParticipant?.username?.substring(0, 1)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                {oppositeParticipant?.username}
              </p>
              <p className="text-sm">
                Start chat with {oppositeParticipant?.username}!
              </p>
            </div>
          </div>
          <div
            className={classNames(
              "relative flex-1 p-5 overflow-y-auto scrollbar-thumb-base-content scrollbar-track-base-300 scrollbar-thin scrollbar-track-rounded-md scrollbar-thumb-rounded-md",
              {
                "hidden ":
                  video ||
                  messages?.length === 0 ||
                  !currentChat ||
                  (currentChat && isMessagesLoading),
              }
            )}
          >
            {messages?.length > 0 &&
              messages?.map(
                (message: Message, index: number, messages: Message[]) => {
                  const messageDate = formatDate(new Date(message.createdAt));
                  let suffix = getDaySuffix(
                    new Date(message.createdAt).getDate()
                  );
                  if (index === 0) {
                    previousDate = "";
                  } else {
                    previousDate = formatDate(
                      new Date(messages[index - 1].createdAt)
                    );
                  }

                  if (message.authorId === currentUserId) {
                    return (
                      <div key={message.id}>
                        <div
                          className={classNames({
                            "mx-auto my-1.5 py-1.5 px-3 bg-base-300 rounded-box text-base-content opacity-50 w-fit border border-base-content text-xs font-semibold":
                              previousDate !== messageDate,
                          })}
                        >
                          {previousDate === messageDate ? (
                            ""
                          ) : (
                            <>
                              {new Date(messageDate).toLocaleString("en-US", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                              <sup>{suffix}</sup>
                            </>
                          )}
                        </div>
                        <div className="chat chat-end">
                          <div className="chat-image avatar placeholder  mask mask-squircle">
                            <div className="bg-accent text-accent-content rounded-full w-8 glass">
                              <span className="text-lg uppercase font-semibold">
                                {username && username.substring(0, 1)}
                              </span>
                            </div>
                          </div>
                          <div className="chat-bubble chat-bubble-accent ">
                            {message.content}
                          </div>
                          <div className="chat-footer opacity-50">
                            <time className="text-xs">
                              {new Date(message?.createdAt).toLocaleString(
                                "en-US",
                                {
                                  timeStyle: "short",
                                }
                              )}
                            </time>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={message?.id}>
                      <div
                        className={classNames({
                          "mx-auto my-1.5 py-1.5 px-3 bg-base-300 rounded-box text-base-content opacity-50 w-fit border border-base-content text-xs font-semibold":
                            previousDate !== messageDate,
                        })}
                      >
                        {previousDate === messageDate ? (
                          ""
                        ) : (
                          <>
                            {new Date(messageDate).toLocaleString("en-US", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                            <sup>{suffix}</sup>
                          </>
                        )}
                      </div>
                      <div className="chat chat-start">
                        <div className="chat-image avatar placeholder">
                          <div
                            className={
                              "rounded-full w-8 bg-secondary text-secondary-content glass"
                            }
                          >
                            <span className="text-lg uppercase font-semibold">
                              {oppositeParticipant?.username?.substring(0, 1)}
                            </span>
                          </div>
                        </div>
                        <div className="chat-bubble  chat-bubble-secondary">
                          {message.content}
                        </div>
                        <div className="chat-footer opacity-50">
                          <time className="text-xs">
                            {new Date(message?.createdAt).toLocaleString(
                              "en-US",
                              {
                                timeStyle: "short",
                              }
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            <div ref={bottomRef} />
          </div>

          <form
            className={classNames("flex items-center gap-3 px-5 py-2", {
              "hidden ":
                video ||
                !currentChat ||
                (currentChat && isMessagesLoading) ||
                (!currentChat && messages.length === 0),
            })}
            onSubmit={onSubmit}
          >
            <input
              type="text"
              placeholder={`Message ${oppositeParticipant.username}`}
              className="input  bg-base-300 focus:outline-none w-full glass text-base-content"
              {...register("message")}
            />
            <button
              className={classNames(
                "btn btn-outline btn-primary bg-base-300 glass",
                {
                  "btn-disabled": !isValid || isSubmitting,
                }
              )}
            >
              {isSubmitting ? (
                <span className="loading loading-infinity loading-lg " />
              ) : (
                "Send"
              )}
            </button>
          </form>
          {/* <Video
          audio={true}
          video={true}
          chatId={currentChat}
          videoOn={!!video}
        /> */}
        </div>
      </div>
    </>
  );
};
function getDaySuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDate(date: Date) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    options as Intl.DateTimeFormatOptions
  );
  return formatter.format(date);
}

export default Chat;
