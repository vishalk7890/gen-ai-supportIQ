import { useEffect } from "react";

export const useDangerAlert = (error, setAlert) => {
  useEffect(() => {
    if (error) {
      console.error(error);
      if (typeof setAlert === 'function') {
        setAlert({
          heading: "Something went wrong",
          variant: "danger",
          text: `${error}`,
        });
      }
    }
  }, [error, setAlert]);
};
