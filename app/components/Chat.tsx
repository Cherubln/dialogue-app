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
    setMessages,
  } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [currentChat, setCurrentChat] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [oppositeParticipant, setOppositeParticipant] = useState<{
    username: string | null;
  }>({ username: null });
  const [showUsersPanel, setShowUsersPanel] = useState(true);
  const bottomRef = useRef<ElementRef<"div">>(null);
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

  console.log(messages);

  return (
    <div className={classNames("grid ", { "md:grid-cols-[32%,auto]": !video })}>
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
          <div className="flex justify-between items-center glass rounded-box p-3 bg-base-300">
            <div
              className={`relative w-fit capitalize text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-orange-400 font-extrabold text-2xl`}
            >
              <span className="p-2 inline-block ">Dialogue</span>
              <Image
                src={cirlceWrapper}
                className="absolute left-0 top-0 h-full w-full "
                alt="circle"
              />
            </div>
            <div>
              <div className="dropdown dropdown-hover dropdown-end">
                <label
                  tabIndex={0}
                  className="rounded-box cursor-pointer p-1 m-1 btn-ghost"
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
                  className="flex flex-col-reverse gap-2 dropdown-content z-[1] menu p-2 shadow bg-base-300 glass rounded-box w-52"
                >
                  <span className="btn btn-sm btn-ghost text-primary text-sm w-full font-semibold">
                    <a>Logout</a>
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
            </div>
          </div>
          <div className="border border-base-100   rounded-box overflow-hidden">
            <h2 className="text-xl font-semibold border-b border-base-300 p-3 text-primary shadow bg-base-100">
              Chats
            </h2>
            <div className="h-[calc(100vh-10rem)] overflow-auto">
              <div className="">
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
                          "hover:bg-base-300 hover:text-primary  hover:border-none hover:glass p-3 cursor-pointer border-b last:border-b-0 border-base-100  font-semibold",
                          {
                            "bg-base-300 glass text-primary border-none":
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
                                "rounded-box w-10 bg-base-200 text-base-content glass mask mask-squircle"
                              }
                            >
                              <span className="text-xl uppercase font-semibold">
                                {user.username.substring(0, 1)}
                              </span>
                            </div>
                          </div>
                          <div>{user.username}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
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
        {messages.length === 0 ||
          (isMessagesLoading && (
            <span className="loading loading-infinity loading-lg text-primary" />
          ))}
        <div
          className={classNames(
            "glass bg-base-300 p-2 gap-3 cursor-pointer flex items-center ",
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
                  "rounded-full w-8 bg-primary text-primary-content glass"
                }
              >
                <span className="text-xl uppercase font-semibold">
                  {oppositeParticipant?.username?.substring(0, 1)}
                </span>
              </div>
            </div>
            <div className="text-base">{oppositeParticipant?.username}</div>
          </div>
          {/* <VideoButton /> */}
        </div>

        <div
          className={classNames("flex flex-col items-center justify-center", {
            "hidden ": !!currentChat,
          })}
        >
          <div
            className={`relative w-fit capitalize text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-orange-400 font-extrabold text-6xl p-5`}
          >
            <span className="p-2 inline-block ">Dialogue</span>
            <Image
              src={cirlceWrapper}
              className="absolute left-0 top-0 h-full w-full "
              alt="circle"
            />
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-orange-400  text-center mt-3  text-xl">
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
                  className="w-4 h-4 stroke-current"
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
                    Hi 👋 I am Cherubin, Software Developer. I built this
                    &ldquo;Dialogue&rdquo; App. You can find more at my
                    <a
                      href="https://github.com/Cherubln"
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {" "}
                      Github page
                    </a>
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
          <div className="flex flex-col gap-2 mb-20">
            <div>
              <div className="chat-image avatar placeholder">
                <div
                  className={
                    "rounded-full w-24 bg-primary text-primary-content glass"
                  }
                >
                  <span className="text-6xl uppercase font-semibold">
                    {oppositeParticipant?.username?.substring(0, 1)}
                  </span>
                </div>
              </div>
            </div>
            <p className="font-semibold text-4xl">
              {oppositeParticipant?.username}
            </p>
            <p className="text-sm">
              Start chatting with {oppositeParticipant?.username} here!
            </p>
          </div>
        </div>
        <div
          className={classNames("flex-1 p-5 overflow-y-auto", {
            "hidden ":
              video ||
              messages?.length === 0 ||
              !currentChat ||
              (currentChat && isMessagesLoading),
          })}
        >
          {messages?.length > 0 &&
            messages?.map((message: Message) => {
              if (message.authorId === currentUserId) {
                return (
                  <div className="chat chat-end" key={message.id}>
                    <div className="chat-image avatar placeholder  mask mask-squircle">
                      <div className="bg-accent text-accent-content rounded-full w-8">
                        <span className="text-lg uppercase font-semibold">
                          {username && username.substring(0, 1)}
                        </span>
                      </div>
                    </div>
                    <div className="chat-bubble chat-bubble-accent">
                      {message.content}
                    </div>
                    <div className="chat-footer opacity-50">
                      <time className="text-xs hover:underline">
                        <Timeago
                          date={message?.createdAt}
                          title={new Date().toLocaleString("en-US", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })}
                        />
                      </time>
                    </div>
                  </div>
                );
              }
              return (
                <div className="chat chat-start" key={message?.id}>
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
                    <time className="text-xs hover:underline">
                      <Timeago
                        date={message.createdAt}
                        title={new Date().toLocaleString("en-US", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      />
                    </time>
                  </div>
                </div>
              );
            })}
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
            placeholder="Type here"
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
  );
};

export default Chat;
