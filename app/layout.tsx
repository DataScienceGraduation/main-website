"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  Footer,
  Navbar,
  NavbarBrand,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
  Button,
} from "flowbite-react";
import Image from "next/image";
import TransitionWrapper from "./TransitionWrapper";
import router from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setHasToken(false);
    router.push("/login");
  };

  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <Navbar fluid rounded>
          <NavbarBrand href="/">
            <Image
              src="/logo.svg"
              className="mr-3"
              alt="AutoML Logo"
              width={200}
              height={50}
            />
          </NavbarBrand>
          <div className="mx-auto text-center md:mx-0">
            <NavbarToggle />
            <NavbarCollapse>
              {hasToken ? (
                <>
                  <NavbarLink
                    href="/app"
                    className="my-auto mt-2 inline-block text-gray-700"
                  >
                    Go to App
                  </NavbarLink>
                  <NavbarLink
                    href="#"
                    onClick={handleLogout}
                    className="ml-2 mt-2 text-gray-700"
                  >
                    Logout
                  </NavbarLink>
                  <Button color="blue" className="ml-2" href="/app/new">
                    + Create New Model
                  </Button>
                </>
              ) : (
                <NavbarLink href="/login" className="text-gray-700">
                  Login
                </NavbarLink>
              )}
            </NavbarCollapse>
          </div>
        </Navbar>

        <TransitionWrapper>{children}</TransitionWrapper>

        <Footer container>
          <div className="w-full py-12 px-20 flex items-center justify-between ">
            <div className="grid grid-rows-1 gap-16">
              <div className="m-auto">
                <Footer.Brand

                  href="/"
                  src="/logo.svg" className="ml-3"
                  alt="AutoML Logo"
                  width={200}
                  height={50}
                />
              </div>
              <div className="m-auto sm:flex sm:items-center sm:justify-between">
              <Footer.Copyright
                by="AutoML"
                href="#"
                year={new Date().getFullYear()}
              />
              </div>
            </div>  
              <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-6">
                <div>
                  <Footer.Title title="Resources" />
                  <Footer.LinkGroup col>
                    <Footer.Link href="#">Documentation</Footer.Link>
                    <Footer.Link href="#">Tutorials</Footer.Link>
                  </Footer.LinkGroup>
                </div>
                <div>
                  <Footer.Title title="Contact Us" />
                  <Footer.LinkGroup col>
                    <Footer.Link href="#">LinkedIn</Footer.Link>
                    <Footer.Link href="#">Twitter</Footer.Link>
                    <Footer.Link href="#">Instagram</Footer.Link>
                    <Footer.Link href="#">Facebook</Footer.Link>
                  </Footer.LinkGroup>
                </div>
              </div>
                      
          </div>
        </Footer>
      </body>
    </html>
  );
}
