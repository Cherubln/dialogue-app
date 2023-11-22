"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/app/validationSchemas";
import classNames from "classnames";
import ErrorMessage from "./ErrorMessage";
import { useAuthContext } from "../auth-provider";

type RegisterForm = z.infer<typeof registerSchema>;

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { setId, setUsername } = useAuthContext();
  const [isRegister, setIsRegister] = useState(false);

  const checkUser = async () => {
    try {
      const {
        data: { username, id },
      } = await axios.get("/api/login");
      setUsername(username);
      setId(id);
    } catch {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    const url = isRegister ? "/api/register" : "/api/login";
    try {
      setError("");
      const res = await axios.post(url, data);
      setId(res.data.id);
      setUsername(res.data.username);
    } catch (error) {
      const errorMessage = !isRegister
        ? error?.response.data.message
        : "An unexpected error occured.";

      setError(errorMessage);
    }
  });

  return (
    <div className="h-screen grid place-items-center">
      {isLoading ? (
        <span className="loading loading-bars loading-lg"></span>
      ) : (
        <form
          className="flex flex-col gap-5 glass rounded-box px-12 py-4 max-w-md"
          onSubmit={onSubmit}
        >
          <div className="text-3xl mb-4 uppercase text-primary font-semibold text-center">
            Welcome
          </div>
          <div className="form-control">
            <input
              type="text"
              placeholder="username"
              className="input w-full max-w-md"
              {...register("username")}
            />
            <ErrorMessage>{errors.username?.message}</ErrorMessage>
          </div>
          <div className="form-control">
            <input
              type="password"
              placeholder="password"
              className="input w-full max-w-md"
              {...register("password")}
            />
            <ErrorMessage>{errors.password?.message}</ErrorMessage>
          </div>
          <button
            className={classNames("btn btn-outline btn-primary", {
              "btn-disabled": isSubmitting,
            })}
          >
            {isRegister ? "Register " : "Login "}
            {isSubmitting && (
              <span className="loading loading-infinity loading-lg"></span>
            )}
          </button>
          <div>
            <span>
              {isRegister
                ? "Already have an acount?"
                : "Don't have an account?"}
            </span>{" "}
            <span
              className="text-primary hover:underline cursor-pointer"
              onClick={() => setIsRegister((prev) => !prev)}
            >
              {isRegister ? "Login" : "Register"}
            </span>
          </div>
          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6 cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                onClick={() => setError("")}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default Register;
