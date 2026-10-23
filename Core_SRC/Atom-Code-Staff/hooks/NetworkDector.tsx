import { useEffect, useState } from "react";
import { toast } from "sonner";

// Extend the Navigator type to include 'connection'
interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

interface NavigatorExtended extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const onlineStatus = navigator.onLine;
      const connection = (navigator as NavigatorExtended).connection 
        || (navigator as NavigatorExtended).mozConnection 
        || (navigator as NavigatorExtended).webkitConnection;

      if (connection) {
        setNetworkType(connection.effectiveType);
        if (onlineStatus && (connection.effectiveType === "2g" || connection.effectiveType === "slow-2g")) {
          toast.error("Slow Network Detected");
        }
      }

      if (isOnline !== null && onlineStatus !== isOnline) {
        if (onlineStatus) {
          toast.success("Internet Connected");
        } else {
          toast.error("Internet Disconnected");
        }
      }
      setIsOnline(onlineStatus);
    };

    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const connection = (navigator as NavigatorExtended).connection 
      || (navigator as NavigatorExtended).mozConnection 
      || (navigator as NavigatorExtended).webkitConnection;

    if (connection) {
      connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (connection) {
        connection.removeEventListener("change", updateStatus);
      }
    };
  }, [isOnline]);

  if (isOnline === null) return null;

  return (
    <>
      <div className={isOnline ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
        {isOnline ? "Online" : "Offline"}
      </div>
    </>
  );
};

export default OnlineStatus;
