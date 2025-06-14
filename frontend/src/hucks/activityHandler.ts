import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/app/redux/slices/authSlice";
import { useRouter } from "next/navigation";

export const useActivityHandler = () => {
  const user = useSelector((state: any) => state.auth.user);
  const socket = useSelector((state: any) => state.socket.socket);
  const dispatch = useDispatch();
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = () => {
    if (user && socket) {
      console.log("<====Отправляем log_out, userID:====>", user._id);
      socket.emit("log_out", { userID: user._id });
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(clearUser());
    router.replace("/");
  };

  // Отслеживание активности
  useEffect(() => {
    if (!user || !socket) return;

    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
      console.log("<====Пользователь активен, обновляем lastActivity====>");
      socket.emit("ping"); // Отправляем пинг при активности
    };

    const events = ["click", "keydown", "scroll", "mousemove"];
    events.forEach((event) => {
      window.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Отслеживание переходов по страницам
    const handleRouteChange = () => {
      updateLastActivity();
    };
    router.events?.on("routeChangeComplete", handleRouteChange);

    // Проверка неактивности каждую минуту
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime >= 30 * 60 * 1000) {
        // 30 минут
        console.log("<====Неактивность 30 минут, выполняем log_out====>");
        handleLogout();
      }
    }, 60 * 1000); // Каждую минуту

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
      router.events?.off("routeChangeComplete", handleRouteChange);
      clearInterval(checkInactivity);
    };
  }, [user, socket, router, dispatch]);

  // Пинг при начальной загрузке
  useEffect(() => {
    if (user && socket) {
      console.log("<====Отправляем начальный ping для user:====>", user._id);
      socket.emit("ping");
    }
  }, [user, socket]);

  return { handleLogout };
};
