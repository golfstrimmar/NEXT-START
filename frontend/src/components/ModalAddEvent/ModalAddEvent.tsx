"use client";
import React, { useEffect, useState } from "react";
import styles from "./ModalAddEvent.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button/Button";
import { useSelector } from "react-redux";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { Socket } from "dgram";

// ----------------------------
interface User {
  _id: string;
  userName: string;
  email: string;
  passwordHash: string;
  avatar: string;
  googleId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Message {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}
const ModalAddEvent = ({ onClose }) => {
  const user: User = useSelector((state) => state.auth.user);

  const socket: Socket = useSelector((state) => state.socket.socket);
  const [NewMessage, setNewMessage] = useState<Message>({
    id: "",
    text: "",
    author: "",
    createdAt: "",
  });
  const [text, setText] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  // ----------------------------

  useEffect(() => {
    if (user) {
      console.log("<==== user====>", user);
    }
  }, []);

  useEffect(() => {
    if (NewMessage) {
      console.log("<==== NewMessage====>", NewMessage);
      setNewMessage((prev) => {
        return {
          ...prev,
          author: user._id,
          text: text,
        };
      });
    }
  }, [text]);
  // ----------------------------
  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (NewMessage.text === "") {
      console.log("<==== Text is required====>");
      setError("Text is required");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }

    console.log("<==== NewMessage====>", NewMessage);
    socket.emit("send_message", NewMessage);
    socket.on("new_message", (message) => {
      console.log("<====New message from server====>", message);
    });
    // onClose();
  };
  // ----------------------------

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-[100vw] h-[100vh] fixed top-0 pt-20 sm:pt-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100 p-4 "
      >
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-300 rounded-lg p-1 sm:p-4 "
        >
          {error && <ModalMessage message={error} open={showModal} />}
          <Image
            onClick={() => onClose()}
            src="/assets/svg/cross.svg"
            alt="cross"
            width={24}
            height={24}
            className="absolute top-6 right-10 cursor-pointer z-50 border border-gray-300 rounded-full p-1 hover:bg-gray-200 transition-all duration-200"
          />
          <form
            // onSubmit={handleCreateMessage}
            className="w-full relative mb-8 bg-white border border-gray-300 rounded-lg p-1 sm:p-4"
          >
            <h2 className="text-2xl font-semibold mb-4">
              User: {user.userName}
            </h2>
            <div className="mb-4">
              <Input
                typeInput="textarea"
                id="text"
                data="Text"
                name="text"
                value={NewMessage.text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button
              buttonText="Create Message"
              buttonType="submit"
              onClick={(e) => handleCreateMessage(e)}
            />
          </form>{" "}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAddEvent;

// return (
//   <AnimatePresence>
//     {showLocationManager && (
//       <LocationManager
//         token={token}
//         userId={ID || null}
//         onClose={() => setShowLocationManager(false)}
//       />
//     )}
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="w-[100vw] h-[100vh] fixed top-0 pt-20 sm:pt-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100 p-4"
//     >
//       <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
//       <motion.div
//         initial={{ scale: 0, y: 0 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 20 }}
//         className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-300 rounded-lg p-1 sm:p-4"
//       >
//         <form
//           onSubmit={handleCreateEvent}
//           className="w-full relative mb-8 bg-white border border-gray-300 rounded-lg p-1 sm:p-4"
//         >
//           <Image
//             onClick={() => setShowCreateModal(false)}
//             src="/assets/svg/cross.svg"
//             alt="cross"
//             width={24}
//             height={24}
//             className="absolute top-4 right-4 cursor-pointer z-50 border border-gray-300 rounded-full p-1 hover:bg-gray-200 transition-all duration-200"
//           />
//           <h2 className="text-xl font-semibold mb-4">Create Event</h2>
//           {/* Title */}
//           <div className="mb-4">
//             <Input
//               typeInput="text"
//               id="title"
//               data="Title"
//               name="title"
//               value={newEvent.title}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, title: e.target.value })
//               }
//               required
//             />
//           </div>
//           {/* Content */}
//           <div className="mb-4">
//             <Input
//               typeInput="textarea"
//               id="content"
//               data="Content"
//               name="content"
//               value={newEvent.content}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, content: e.target.value })
//               }
//               required
//             />
//           </div>
//           {/* Date */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Date: {new Date(selectedDay).toLocaleDateString("de-DE")}
//             </label>
//           </div>
//           {/* Start Time */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Start Time: {newEvent.time}
//             </label>
//             <ClockUhr
//               value={newEvent.time}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, time: e.target.value })
//               }
//             />
//           </div>
//           {/* End Date and Time */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               End Date (Optional):
//               {newEvent.endDate
//                 ? new Date(newEvent.endDate).toLocaleDateString("de-DE", {
//                     year: "numeric",
//                     month: "2-digit",
//                     day: "2-digit",
//                   })
//                 : "Not Selected"}
//             </label>
//             <label className="block text-sm font-medium text-gray-700">
//               End Time (Optional): {newEvent.endTime || "Not Selected"}
//             </label>
//             <br className="my-1" />
//             <Calendar
//               selectedDay={new Date(newEvent.endDate)}
//               handleDateChange={handleDateChange}
//             />
//             <br className="my-1" />
//             <ClockUhr
//               value={newEvent.endTime}
//               onChange={(e) =>
//                 setNewEvent({ ...newEvent, endTime: e.target.value })
//               }
//             />
//           </div>
//           {/* Media from Device */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Add Media from Device
//             </label>
//             <input
//               type="file"
//               multiple
//               onChange={handleFileChange}
//               className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             />
//           </div>
//           {/* Saved Media */}
//           {renderSavedMedia}
//           {/* Selected Media */}
//           {renderSelectedMedia}
//           {/* Location */}
//           <div className="mb-4">
//             <div className="flex gap-2 mb-2">
//               <button
//                 type="button"
//                 onClick={() => setShowLocationManager(true)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition cursor-pointer"
//               >
//                 Add New Location
//               </button>
//             </div>
//             {renderLocations}
//             <div className="h-64 w-full">
//               <EventMap
//                 interactive
//                 onLocationSelect={(coords) => {
//                   setLocation({
//                     coordinates: coords,
//                     address: location?.address || "",
//                   });
//                 }}
//                 selectedLocation={location?.coordinates}
//               />
//             </div>
//           </div>
//           <Button buttonText="Create Event" buttonType="submit" />
//         </form>
//       </motion.div>
//     </motion.div>
//   </AnimatePresence>
// );
