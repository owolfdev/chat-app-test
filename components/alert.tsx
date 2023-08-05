import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type AlertProps = {
  action: (id: string) => Promise<void>;
  item: string;
  message: string;
  title: string;
};

export function Alert({ action, item, message, title }: AlertProps) {
  const handleAction = () => {
    console.log("action:", action);
    console.log("item:", item);
    action(item);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="absolute bg-gray-800 text-white rounded-full w-4 h-4 focus:outline-none text-xs flex items-center justify-center top-0 right-0 transform translate-x-[10%] -translate-y-[-50%] pb-0.5">
          x
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAction}>
            Yes, delete it
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
