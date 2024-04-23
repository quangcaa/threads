import { Button } from "@chakra-ui/button";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import authScreenAtom from "../atoms/authAtom";

const LogoutButton = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:1000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      //   console.log(data);
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      localStorage.removeItem("userInfo");
      setUser(null);
    } catch (error) {
      console.log(error);
    }

    setAuthScreen("login");
  };
  return (
    <Button
      position={"fixed"}
      top={"30px"}
      right={"30px"}
      size={"sm"}
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
};

export default LogoutButton;
