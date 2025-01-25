"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCompletion } from "ai/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { User } from "@/model/User.model";

const initialMessage = "What's your favorite movie?||Do you have any pets?||What's your dream job?"

export default function sendMessage(request: Request) {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { data: session } = useSession();
  const user: User = session?.user as User;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const { completion, complete, isLoading: isSuggestLoading, error } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessage
  });

  let messageArr = completion.split("||");

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      // const messageContent = data.content;
      const response = await axios.post("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });

      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      console.log("Error: ", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestMessages = async () => {
    try {
        complete('')
    } catch (error) {
      console.log("Error fetching AI response: ", error)
      toast({
        title: "Error Occured",
        description: "Couldn't fetch messages",
        variant: "destructive"
      })
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue("content", message)
  }

  const getUser = async() => {
    const session = await getServerSession();
    const user = session?.user
    if(user) return true
    return false
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button disabled={isLoading}>Send It</Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
          {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              messageArr.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={()=> handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
     {
        user ? (
          <div className="text-center">
          <div className="mb-4">Check your Messages</div>
          <Link href={"/dashboard"}>
            <Button>Dashboard</Button>
          </Link>
        </div>
        ) : (
          <div className="text-center">
          <div className="mb-4">Get Your Message Board</div>
          <Link href={"/sign-up"}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
        )
      } 
    </div>
  );
}
