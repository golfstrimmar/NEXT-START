"use client";
import React, { useState, useEffect } from "react";
// =================================
// =================================
interface ProductProps {
  _id: string;
  name: string;
  href: number;
  imageSrc: string;
  imageAlt: string;
  price: number;
  color: string;
  // createdAt: string;
  // updatedAt: string;
  // __v: number;
}

const ProductCard: React.FC<ProductProps> = ({ product }) => {
  return (
    <div className="ProductCard">
      <div className=" mx-auto max-w-7xl">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
          {product._id}
        </h2>
        <div className=""></div>
      </div>
    </div>
  );
};
export default ProductCard;
// interface testProps {
//   handlerburgerClick: () => void;
//   isOpen: boolean;
// }
// interface Bid {
//   user: { _id: string; userName: string };
//   amount: number;
//   timestamp: string;
// }
// interface Auction {
//   _id: string;
//   title: string;
//   startPrice: number;
//   endTime: string;
//   imageUrl: string;
//   status: "active" | "ended" | "pending";
//   creator: { userName: string; _id?: string };
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   currentBid?: number;
//   winner?: { user: string; amount: number };
// }

// interface SocketState {
//   socket: Socket | null;
// }

// interface SocketData {
//   user: {
//     _id: string;
//     userName: string;
//     email: string;
//     passwordHash: string;
//     avatar: string;
//     googleId: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//   };
//   token: string;
//   message: string;
// }

// interface User {
//   _id?: string;
//   userName: string;
//   email: string;
//   avatar: string;
//   createdAt: string;
// }

// interface ProfileData {
//   user: { userName: string };
//   createdAuctions: Auction[];
//   auctionsWithBids: Auction[];
//   wonAuctions: Auction[];
// }

// interface Lot {
//   _id: string;
//   title: string;
//   createdAt: string;
//   endTime: string;
//   imageUrl: string;
//   startPrice: number;
//   status: "active" | "ended" | "pending"; // Ограничиваем возможные статусы
//   creator: Creator; // Обновляем тип creator
//   currentBid?: number; // Опционально, так как может отсутствовать
// }

// // Интерфейс пропсов компонента Lot
// interface LotProps {
//   auction: Lot;
// }

// interface ModalAuctionClosedProps {
//   auction: {
//     title?: string;
//     winner?: string;
//     amount?: number;
//   };
//   onClose: () => void;
// }
// interface ModalMessageProps {
//   message: string; // Сообщение, которое будет отображаться
//   open: boolean; // Флаг для управления видимостью модального окна
// }

// interface PaginationProps<T> {
//   items: T[];
//   itemsPerPage: number;
//   currentPage: number;
//   setCurrentPage: (page: number) => void;
// }
// interface BurgerProps {
//   handlerburgerClick: () => void;
//   isOpen: boolean;
// }

// interface ButtonProps {
//   onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
//   children: React.ReactNode;
// }

// interface CalendarProps {
//   handleDateChange?: (date: Date) => void;
//   resetTrigger?: number;
//   setFinishDate?: (date: Date) => void;
//   shouldReset?: boolean;
//   onResetComplete?: () => void;
// }

// const weekdays: string[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
// const months: string[] = [
//   "Januar",
//   "Februar",
//   "März",
//   "April",
//   "Mai",
//   "Juni",
//   "Juli",
//   "August",
//   "September",
//   "Oktober",
//   "November",
//   "Dezember",
// ];
// interface InputProps {
//   typeInput:
//     | "text"
//     | "textarea"
//     | "number"
//     | "datetime-local"
//     | "email"
//     | "tel"
//     | "date"
//     | "password"
//     | "time";
//   data: string;
//   value: string;
//   onChange: (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => void;
//   inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
// }
// interface Item {
//   name: string;
//   value: "asc" | "desc"; // Значение может быть только "asc" или "desc"
// }

// // Пропсы компонента Select
// interface SelectProps {
//   setSortOrder: (order: "asc" | "desc") => void;
//   selectItems: Item[]; // Массив объектов типа Item
// }

// =================================
// const router = useRouter();
// const dispatch = useDispatch();
// const dispatch = useAppDispatch();
// const { id } = useParams();

// const socket = useSelector(
//    (state: RootState) => state.socket.socket
//  ) as Socket | null;
// const user = useAppSelector((state) => state.auth.user);
// const token = useAppSelector((state) => state.auth.token);

// const [title, setTitle] = useState<string>("");
// const [startPrice, setStartPrice] = useState<number>(0);
// const [successMessage, setSuccessMessage] = useState<string>("");
// const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
// const [image, setImage] = useState<File | null>(null);
// const [imagePreview, setImagePreview] = useState<string | null>(null);
// const [imageUrl, setImageUrl] = useState<string | null>(null);
// const [date, setDate] = useState<Date>(new Date());
// const [time, setTime] = useState<string>(
//   new Date().toLocaleString().slice(11, 17)
// );
// const [endTime, setEndTime] = useState<EndTime>({
//   lotDate: new Date().toLocaleString().slice(0, 10),
//   time: "00:00",
// });
// const [auction, setAuction] = useState<Auction | null>(null);
// const [error, setError] = useState("");
// const [timeLeft, setTimeLeft] = useState<string>("");
//  const auctions = useAppSelector(
//   (state: RootState) => state.auctions.auctions
// ) as Auction[];

// const [currentAuctions, setCurrentAuctions] = useState<Auction[]>([]);
// const [tempAuctions, setTempAuctions] = useState<Auction[]>(auctions);
// const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
// const [sortOrderEndTime, setSortOrderEndTime] = useState<"asc" | "desc" | "">(
//   ""
// );
// const [activeSortType, setActiveSortType] = useState<
//   "createdAt" | "endTime" | "none"
// >("none");
// const [closedAuction, setClosedAuction] = useState<Auction | null>(null);

// const selectItems: SelectItem[] = [
//   { name: "Newest First", value: "desc" },
//   { name: "Oldest First", value: "asc" },
// ];

// const [email, setEmail] = useState<string>("");
// const [password, setPassword] = useState<string>("");
// const [profileData, setProfileData] = useState<ProfileData | null>(null);

// const [username, setUsername] = useState<string>("");
// const [formErrors, setFormErrors] = useState<{
//       username: string;
//       email: string;
//       password: string;
//   }>({
//       username: "",
//       email: "",
//       password: "",
//   });
//   const passwordInputRef = useRef<HTMLInputElement | null>(null);
//   const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
//   const [googleData, setGoogleData] = useState<{
//       email: string;
//       userName: string;
//       googleId: string;
//       avatarUrl: string | null;
//   } | null>(null);
// const [googlePassword, setGooglePassword] = useState<string>("");
// const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
// const [bidAmount, setBidAmount] = useState<number | "">("");
// ==============================
// ==============================
// ==============================
// ==============================
