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

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <Navbar fluid rounded>
          <NavbarBrand href="#">
            <Image
              src="https://placehold.co/50x50"
              className="mr-3"
              alt="AutoML Logo"
              width={50}
              height={50}
            />
            <div>
              <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">
                AutoML
              </span>
              <p className="text-sm text-gray-500">
                Simplifying AI, Amplifying Impact
              </p>
            </div>
          </NavbarBrand>
          <div className="mx-auto text-center md:mx-0">
            <NavbarToggle />
            <NavbarCollapse>
              <Button color="success" href="#">
                Login
              </Button>
            </NavbarCollapse>
          </div>
        </Navbar>
        {children}
        <Footer container={true}>
          <div className="w-full py-12">
            <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:justify-between lg:flex lg:justify-between">
              <div>
                <Footer.Brand
                  href="#"
                  src="https://placehold.co/50x50"
                  alt="AutoML Logo"
                  width={50}
                  height={50}
                  name="AutoML"
                />
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
                <div>
                  <Footer.Title title="Resources" />
                  <Footer.LinkGroup col={true}>
                    <Footer.Link href="#">Documentation</Footer.Link>
                    <Footer.Link href="#">Tutorials</Footer.Link>
                  </Footer.LinkGroup>
                </div>
                <div>
                  <Footer.Title title="Contact Us" />
                  <Footer.LinkGroup col={true}>
                    <Footer.Link href="#">LinkedIn</Footer.Link>
                    <Footer.Link href="#">Twitter</Footer.Link>
                    <Footer.Link href="#">Instagram</Footer.Link>
                    <Footer.Link href="#">Facebook</Footer.Link>
                  </Footer.LinkGroup>
                </div>
              </div>
            </div>
            <Footer.Divider />
            <div className="w-full sm:flex sm:items-center sm:justify-between">
              <Footer.Copyright
                by="AutoML"
                href="#"
                year={new Date().getFullYear()}
              />
            </div>
          </div>
        </Footer>
      </body>
    </html>
  );
}
