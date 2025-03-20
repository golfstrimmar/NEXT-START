// import TheSearch from "@/components/TheSearch/TheSearch";
// const articles = useSelector(
//   (state: RootState) => state.articles.articles
// ) as ArticleData[];
// const [filtered, setFiltered] = useState<ArticleData[]>(articles);
// useEffect(() => {
//   articles.map((foo) => {
//     console.log("<====foo====>", foo);
//   });
// }, [articles]);
// useEffect(() => {
//   filtered.map((foo) => {
//     console.log("<====foo====>", foo);
//   });
// }, [filtered]);
//  <TheSearch onSearch={setFiltered} />;

//  {
//    filtered.length > 0 &&
//      filtered.map((foo) => {
//        return <h3 key={foo._id}>{foo.title}</h3>;
//      });
//  }

("use client");
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store"; // Убедитесь, что путь правильный
// import styles from "./TheSearch.module.scss";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";

// Интерфейс для статьи (должен совпадать с вашей структурой данных)
interface ArticleData {
  _id: string;
  category: string;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  tag?: string;
  textenCopy?: string[];
}

// Пропсы компонента
interface Props {
  onSearch: (filteredArticles: ArticleData[]) => void; // Коллбэк для передачи отфильтрованных статей
}

const TheSearch = ({ onSearch }: Props) => {
  const [search, setSearch] = useState<string>("");

  // Получаем статьи из Redux
  const articles = useSelector(
    (state: RootState) => state.articles.articles
  ) as ArticleData[];

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filteredArticles = articles.filter((article) =>
      article.title.toLowerCase().includes(search.toLowerCase())
    );
    onSearch(filteredArticles); // Передаём отфильтрованные статьи родителю
    setSearch(""); // Опционально: очищаем поле после поиска
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        typeInput="search"
        data="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button>Search</Button>
    </form>
  );
};

export default TheSearch;
