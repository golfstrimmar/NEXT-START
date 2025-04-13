async function getCategories() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories}`,
   { method: "GET", cache: "no-store" }
  );
  if (!response.ok) throw new Error("Failed to fetch initial products");
  return response.json();
}
export default getCategories;
