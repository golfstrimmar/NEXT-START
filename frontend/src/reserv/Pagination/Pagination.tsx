// import Pagination from "@/reserv/Pagination/Pagination";
//  const [currentPage, setCurrentPage] = useState<number>(1);
//  const itemsPerPage = 5;
//  const indexOfLastItem = currentPage * itemsPerPage;
//  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   Обновление currentAuctions по createdAt
//   useEffect(() => {
//     if (activeSortType === "createdAt") {
//       setTempAuctions(sortAuctions);
//       setCurrentAuctions(sortAuctions.slice(indexOfFirstItem, indexOfLastItem));
//     }
//   }, [sortAuctions, indexOfFirstItem, indexOfLastItem, activeSortType]);

//   // Обновление currentAuctions по endTime
//   useEffect(() => {
//     if (activeSortType === "endTime") {
//       setTempAuctions(sortEndTime);
//       setCurrentAuctions(sortEndTime.slice(indexOfFirstItem, indexOfLastItem));
//     }
//   }, [sortEndTime, indexOfFirstItem, indexOfLastItem, activeSortType]);

//   // Обновление currentAuctions без сортировки
//   useEffect(() => {
//     if (activeSortType === "none") {
//       const activeAuctions = auctions.filter(isAuctionActive);
//       setTempAuctions(activeAuctions);
//       setCurrentAuctions(
//         activeAuctions.slice(indexOfFirstItem, indexOfLastItem)
//       );
//     }
//   }, [auctions, activeSortType, indexOfFirstItem, indexOfLastItem]);

//  {
//    currentAuctions.length > 0 && (
//      <Pagination
//        items={tempAuctions}
//        itemsPerPage={itemsPerPage}
//        currentPage={currentPage}
//        setCurrentPage={setCurrentPage}
//      />
//    );
//  }

import React, { useEffect } from "react";
import ShevronLeft from "@/assets/svg/chevron-left.svg";
import ShevronRight from "@/assets/svg/chevron-right.svg";

interface PaginationProps<T> {
  items: T[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Pagination = <T,>({
  items,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}: PaginationProps<T>) => {
  useEffect(() => {
    items.map((post) => {
      console.log(
        "===== items pagination=====",
        new Date(post.createdAt).toLocaleString()
      );
    });
  }, [items]);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center gap-4 justify-center mt-3">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="
px-2 py-2
bg-gray-200
rounded-full
disabled:opacity-50
 overflow-hidden
 cursor-pointer
 outline
 outline-gray-400
 hover:outline
 hover:outline-gray-600
 transition
 duration-200 ease-in-out
 "
      >
        <ShevronLeft className="w-3 h-3 opacity-50 "></ShevronLeft>
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="
                px-2 py-2
bg-gray-200
rounded-full
disabled:opacity-50
 overflow-hidden
 cursor-pointer
 outline
 outline-gray-400
 hover:outline
 hover:outline-gray-600
 transition
 duration-200 ease-in-out"
      >
        <ShevronRight className="w-3 h-3 opacity-50 "></ShevronRight>
      </button>
    </div>
  );
};

export default Pagination;
