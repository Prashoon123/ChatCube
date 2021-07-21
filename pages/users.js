import React from "react";
import { db } from "../firebase";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { useRouter } from "next/router";
import * as EmailValidator from "email-validator";
import { useCollection } from "react-firebase-hooks/firestore";
import useDarkMode from "../hooks/useDarkMode";
import NightsStayIcon from "@material-ui/icons/NightsStay";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import Head from "next/head";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import Image from "next/image";

function Users({ users }) {
  const router = useRouter();
  const user = window.Clerk.user;
  const [colorTheme, setTheme] = useDarkMode();

  const userChatsRef = db
    .collection("chats")
    .where("users", "array-contains", user.primaryEmailAddress.emailAddress);
  const [chatsSnapshot] = useCollection(userChatsRef);

  const createChat = (input) => {
    if (!input) return;
    if (
      EmailValidator.validate(input) &&
      !chatAlreadyExist(input) &&
      input !== user.primaryEmailAddress.emailAddress
    ) {
      db.collection("chats").add({
        users: [user.primaryEmailAddress.emailAddress, input],
      });
    }
  };

  const chatAlreadyExist = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  return (
    <div>
      <Head>
        <title>Let's chat</title>
        <meta name="description" content="Let's start chatting" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className="border-[1px] w-[30vw] border-indigo-500 dark:border-gray-700 h-[90vh] m-10 min-w-[300px] max-w-[400px] overflow-y-scroll hidescrollbar rounded-xl">
        <div className="flex sticky top-0 justify-between items-center p-4 h-20 bg-indigo-700 border-b-[1px] border-indigo-500 dark:border-gray-700 z-10">
          <ArrowBackIcon
            onClick={() => router.push("/")}
            className="h-9 focus:outline-none  dark:text-white text-black mr-2 cursor-pointer"
          />
          <p className="dark:text-gray-200">
            Click on any user to create a chat
          </p>
          <div className="focus:outline-none">
            {colorTheme === "light" ? (
              <EmojiObjectsIcon
                onClick={() => setTheme("light")}
                className="h-9  dark:text-gray-200 mr-2 cursor-pointer"
              />
            ) : (
              <NightsStayIcon
                onClick={() => setTheme("dark")}
                className="h-9 text-black  mr-2 cursor-pointer"
              />
            )}
          </div>
        </div>
        {users.map(({ id, name, email, photoURL }) => (
          <div
            key={id}
            onClick={(e) => {
              createChat(email);
              toast.success("Chat created successfully");
              router.push(`/`);
            }}
          >
            {email === user.primaryEmailAddress.emailAddress ? (
              <div></div>
            ) : (
              <div className="flex items-center cursor-pointer p-4 break-words bg-indigo-700 hover:bg-indigo-400 border-b-[1px] border-indigo-500 dark:border-gray-700 dark:hover:bg-gray-900 dark:text-white">
                <Image
                  width={56}
                  height={56}
                  src={photoURL}
                  className="cursor-pointer rounded-full hover:opacity-80"
                />
                <div className="flex cursor-pointer break-words flex-col ml-3">
                  <p>{name}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;

export async function getServerSideProps() {
  const allusers = await db.collection("users").get();

  const users = allusers.docs.map((user) => ({
    id: user.id,
    ...user.data(),
    lastSeen: null,
  }));
  return {
    props: { users },
  };
}
