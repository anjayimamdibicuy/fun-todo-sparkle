
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationSystemProps {
  userName: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userName }) => {
  const [hasShownInitialNotification, setHasShownInitialNotification] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'pagi';
    if (hour < 17) return 'siang';
    return 'malam';
  };

  const getRandomMessages = () => {
    const timeOfDay = getTimeOfDay();
    const messages = [
      `Hari ini ${userName} sudah minum berapa gelas? 💧`,
      `Sudah aktivitas apa saja ${timeOfDay} ini ${userName}? 🌟`,
      `Jangan lupa istirahat ya ${userName}! 😊`,
      `${userName}, sudah makan yang bergizi hari ini? 🥗`,
      `Yuk ${userName}, cek progress harian kamu! 📈`,
      `Semangat ${userName}! Kamu bisa! 💪`,
      `${userName}, jangan lupa gerak ringan hari ini ya! 🚶‍♀️`,
      `Sudah tulis jurnal hari ini belum ${userName}? ✍️`
    ];
    return messages;
  };

  useEffect(() => {
    if (!hasShownInitialNotification) {
      const timer = setTimeout(() => {
        const messages = getRandomMessages();
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        toast({
          title: "💡 Reminder",
          description: randomMessage,
        });
        
        setHasShownInitialNotification(true);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Set up periodic notifications
    const intervalId = setInterval(() => {
      const messages = getRandomMessages();
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      toast({
        title: "💭 Just checking in...",
        description: randomMessage,
      });
    }, 300000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, [userName, hasShownInitialNotification]);

  return null;
};

export default NotificationSystem;
