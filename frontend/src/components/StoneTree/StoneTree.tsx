import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Stone {
  id: number;
  content: string;
  level: number;
  parentId: number | null;
}

interface StoneTreeProps {
  stones: Stone[];
  setStones: React.Dispatch<React.SetStateAction<Stone[]>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  getTagName: (tag: string) => string;
  selfClosingTags: string[];
  inlineElements: string[];
  blockElements: string[];
}

const StoneTree: React.FC<StoneTreeProps> = ({
  stones,
  setStones,
  setError,
  setShowModal,
  getTagName,
  selfClosingTags,
  inlineElements,
  blockElements,
}) => {
  const handleRootDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const draggedStone = stones.find((stone) => stone.id === draggedId);

    if (!draggedStone) {
      console.error("Dragged stone not found:", draggedId);
      return;
    }

    setStones((prev) => {
      // Функция для получения поддерева
      const getSubtree = (stoneId: number, stones: Stone[]): Stone[] => {
        const result: Stone[] = [];
        const stone = stones.find((s) => s.id === stoneId);
        if (!stone) return result;
        result.push(stone);
        const children = stones.filter((s) => s.parentId === stoneId);
        for (const child of children) {
          result.push(...getSubtree(child.id, stones));
        }
        return result;
      };

      // Получаем поддерево перемещаемого элемента
      const subtree = getSubtree(draggedId, prev);
      const subtreeIds = subtree.map((s) => s.id);

      // Удаляем поддерево из массива
      let newStones = prev.filter((stone) => !subtreeIds.includes(stone.id));

      // Обновляем уровни для корневого перемещения
      const levelOffset = 0 - draggedStone.level;
      const updatedSubtree = subtree.map((stone) => ({
        ...stone,
        level: stone.level + levelOffset,
        parentId: stone.id === draggedId ? null : stone.parentId,
      }));

      // Вставляем поддерево в конец
      newStones.push(...updatedSubtree);

      return newStones;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const StoneNode = ({ s }: { s: Stone }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("text/plain", s.id.toString());
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (
      e: React.DragEvent<HTMLDivElement>,
      isRoot: boolean = false
    ) => {
      e.preventDefault();
      const draggedId = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (draggedId === s.id && !isRoot) return;

      if (isRoot) {
        // Логика удаления элемента и его потомков
        setStones((prev) => {
          // Функция для получения всех ID поддерева (родитель + потомки)
          const getSubtreeIds = (
            stoneId: number,
            stones: Stone[]
          ): number[] => {
            const result: number[] = [stoneId];
            const children = stones.filter((s) => s.parentId === stoneId);
            for (const child of children) {
              result.push(...getSubtreeIds(child.id, stones));
            }
            return result;
          };

          // Получаем ID всех элементов поддерева
          const subtreeIds = getSubtreeIds(draggedId, prev);

          // Удаляем поддерево из массива stones
          return prev.filter((stone) => !subtreeIds.includes(stone.id));
        });
        return;
      }

      const draggedStone = stones.find((stone) => stone.id === draggedId);
      const targetStone = stones.find((stone) => stone.id === s.id);

      if (!draggedStone) {
        console.error("Dragged stone not found:", draggedId);
        return;
      }

      const draggedTagName = getTagName(draggedStone.content);
      const targetTagName = targetStone ? getTagName(targetStone.content) : "";

      let errorMessage = "";
      if (targetStone) {
        if (/^h[1-6]$/.test(targetTagName) && /^h[1-6]$/.test(draggedTagName)) {
          errorMessage = `Недопустимая вложенность: <${draggedTagName}> не может быть внутри <${targetTagName}>`;
        }
        if (selfClosingTags.includes(targetTagName)) {
          errorMessage = `Недопустимая вложенность: <${targetTagName}> не может содержать <${draggedTagName}>`;
        }
        if (
          inlineElements.includes(targetTagName) &&
          blockElements.includes(draggedTagName)
        ) {
          errorMessage = `Недопустимая вложенность: строчный <${targetTagName}> не может содержать блочный <${draggedTagName}>`;
        }
        if (draggedTagName === "li" && !["ul", "ol"].includes(targetTagName)) {
          errorMessage = `Недопустимая вложенность: <li> должен быть внутри <ul> или <ol>, а не <${targetTagName}>`;
        }
        if (/^h[1-6]$/.test(targetTagName) && draggedTagName === "li") {
          errorMessage = `Недопустимая вложенность: <${draggedTagName}> не может быть внутри заголовка <${targetTagName}>`;
        }
        if (
          targetTagName === "p" &&
          (draggedTagName === "p" || blockElements.includes(draggedTagName))
        ) {
          errorMessage = `Недопустимая вложенность: <p> не может содержать <${draggedTagName}>`;
        }
        const interactiveElements = [
          "a",
          "button",
          "input",
          "select",
          "textarea",
        ];
        if (
          targetTagName === "a" &&
          interactiveElements.includes(draggedTagName)
        ) {
          errorMessage = `Недопустимая вложенность: <a> не может содержать <${draggedTagName}>`;
        }
        if (
          targetTagName === "button" &&
          interactiveElements.includes(draggedTagName)
        ) {
          errorMessage = `Недопустимая вложенность: <button> не может содержать <${draggedTagName}>`;
        }
        if (["dt", "dd"].includes(draggedTagName) && targetTagName !== "dl") {
          errorMessage = `Недопустимая вложенность: <${draggedTagName}> должен быть внутри <dl>, а не <${targetTagName}>`;
        }
        if (draggedTagName === "figcaption" && targetTagName !== "figure") {
          errorMessage = `Недопустимая вложенность: <figcaption> должен быть внутри <figure>, а не <${targetTagName}>`;
        }
        if (["td", "th"].includes(draggedTagName) && targetTagName !== "tr") {
          errorMessage = `Недопустимая вложенность: <${draggedTagName}> должен быть внутри <tr>, а не <${targetTagName}>`;
        }
        if (
          draggedTagName === "tr" &&
          !["table", "tbody", "thead", "tfoot"].includes(targetTagName)
        ) {
          errorMessage = `Недопустимая вложенность: <tr> должен быть внутри <table>, <tbody>, <thead> или <tfoot>, а не <${targetTagName}>`;
        }
      }

      if (errorMessage) {
        setError(errorMessage);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setError("");
        }, 1500);
        return;
      }

      setStones((prev) => {
        // Функция для получения поддерева (родитель + все потомки)
        const getSubtree = (stoneId: number, stones: Stone[]): Stone[] => {
          const result: Stone[] = [];
          const stone = stones.find((s) => s.id === stoneId);
          if (!stone) return result;
          result.push(stone);
          const children = stones.filter((s) => s.parentId === stoneId);
          for (const child of children) {
            result.push(...getSubtree(child.id, stones));
          }
          return result;
        };

        // Получаем поддерево перемещаемого элемента
        const subtree = getSubtree(draggedId, prev);
        const subtreeIds = subtree.map((s) => s.id);

        // Удаляем поддерево из массива stones
        let newStones = prev.filter((stone) => !subtreeIds.includes(stone.id));

        // Определяем новый уровень для перемещаемого элемента
        const newLevel = targetStone ? targetStone.level + 1 : 0;
        const levelOffset = newLevel - draggedStone.level;

        // Обновляем уровни и parentId для элементов поддерева
        const updatedSubtree = subtree.map((stone) => ({
          ...stone,
          level: stone.level + levelOffset,
          parentId:
            stone.id === draggedId ? targetStone?.id ?? null : stone.parentId,
        }));

        // Находим точку вставки
        let insertIndex: number;
        if (targetStone && targetStone.id) {
          const targetIndex = newStones.findIndex(
            (stone) => stone.id === targetStone.id
          );
          if (targetIndex === -1) {
            console.error("Целевой элемент не найден в newStones");
            return prev;
          }
          // Находим индекс последнего потомка целевого элемента
          const lastChildIndex = newStones
            .slice(targetIndex + 1)
            .findIndex((stone) => stone.level <= targetStone.level);
          insertIndex =
            lastChildIndex === -1
              ? newStones.length
              : targetIndex + 1 + lastChildIndex;
        } else {
          insertIndex = newStones.length;
        }

        // Вставляем обновленное поддерево в новую позицию
        newStones.splice(insertIndex, 0, ...updatedSubtree);

        return newStones;
      });
    };

    return (
      <div
        className="rounded border border-red-300 bg-transparent flex items-center gap-2"
        style={{ marginLeft: `${s.level * 20}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, false)}
      >
        <button
          type="button"
          onClick={() =>
            handleDrop(
              {
                preventDefault: () => {},
                dataTransfer: { getData: () => s.id.toString() },
              } as any,
              true
            )
          }
          className="p-1 bg-gray-200 text-gray-500 text-sm rounded hover:bg-gray-300"
        >
          <XMarkIcon width={8} height={8} />
        </button>
        <p className="text-sm">{s.content}</p>
      </div>
    );
  };

  return (
    <div>
      <div
        className="p-2 bg-gray-200 text-center text-gray-500 cursor-move mb-2"
        onDragOver={handleDragOver}
        onDrop={handleRootDrop}
      >
        Перетащите сюда для корневого уровня
      </div>
      <div>
        {stones.map((s) => (
          <StoneNode key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
};

export default StoneTree;
