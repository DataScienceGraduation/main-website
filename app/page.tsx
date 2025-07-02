"use client";

import React from "react";
import { Navbar, Button, Card, Footer } from "flowbite-react";
import { motion, useTransform, useScroll, useSpring } from "motion/react";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const { scrollY } = useScroll();

  const rawImageY = useTransform(scrollY, [0, 300], [0, -100]);
  const smoothImageY = useSpring(rawImageY, { stiffness: 100, damping: 20 });

  const rawTextY = useTransform(scrollY, [0, 300], [0, -30]);
  const smoothTextY = useSpring(rawTextY, { stiffness: 100, damping: 20 });

  const [isHovered, setIsHovered] = React.useState(false);
  const [frozenY, setFrozenY] = React.useState(0);

  const rawParallax = useTransform(scrollY, [0, 300], [0, -30]);
  const smoothParallax = useSpring(rawParallax, {
    stiffness: 100,
    damping: 20,
  });

  React.useEffect(() => {
    if (isHovered) {
      setFrozenY(smoothImageY.get());
    }
  }, [isHovered, smoothImageY]);

  return (
    <div className="min-h-screen bg-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-20 text-center">
        <div className="mx-auto grid gap-8 md:grid-cols-2">
          <motion.div
            className="my-auto pb-16 md:pb-0 md:text-left"
            variants={stagger}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ y: smoothTextY }}
          >
            <h1 className="mb-6 text-5xl font-extrabold text-white sm:text-6xl">
              Revolutionize Your Workflow with Automated Machine Learning
            </h1>
            <p className="mb-10 text-2xl text-white">
              Spend less time wrangling data and more time discovering
              breakthrough insights.
            </p>
            <div className="flex justify-center space-x-6 md:justify-start">
              <Button size="lg">Get Started</Button>
            </div>
          </motion.div>
          <motion.img
            src="hero.png"
            alt="Hero Banner: Automated Machine Learning Platform Background"
            style={{ y: isHovered ? frozenY : smoothImageY }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="shadow-xl transition-shadow duration-300 hover:shadow-2xl"
          />
        </div>
      </section>

      <motion.section
        className="bg-white py-20"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Key Features
          </h2>
          <motion.div
            style={{ y: smoothParallax }}
            className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <svg
                  className="text-gray-800 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                  One-Click Model Training
                </h3>
                <p className="text-gray-600">
                  Automate hyperparameter tuning and model selection with a
                  single click.
                </p>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <svg
                  className="text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1v6M5 19v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1M10 3v4a1 1 0 0 1-1 1H5m2.665 9H6.647A1.647 1.647 0 0 1 5 15.353v-1.706A1.647 1.647 0 0 1 6.647 12h1.018M16 12l1.443 4.773L19 12m-6.057-.152-.943-.02a1.34 1.34 0 0 0-1.359 1.22 1.32 1.32 0 0 0 1.172 1.421l.536.059a1.273 1.273 0 0 1 1.226 1.718c-.2.571-.636.754-1.337.754h-1.13"
                  />
                </svg>

                <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                  Seamless Data Integration
                </h3>
                <p className="text-gray-600">
                  Easily upload CSVs or connect your database in seconds.
                </p>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <svg
                  className="text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.5 2c-.178 0-.356.013-.492.022l-.074.005a1 1 0 0 0-.934.998V11a1 1 0 0 0 1 1h7.975a1 1 0 0 0 .998-.934l.005-.074A7.04 7.04 0 0 0 22 10.5 8.5 8.5 0 0 0 13.5 2Z" />
                  <path d="M11 6.025a1 1 0 0 0-1.065-.998 8.5 8.5 0 1 0 9.038 9.039A1 1 0 0 0 17.975 13H11V6.025Z" />
                </svg>

                <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                  Interactive Dashboards
                </h3>
                <p className="text-gray-600">
                  Visualize real-time metrics with intuitive charts and alerts.
                </p>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card>
                <svg
                  className="text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M6.94318 11h-.85227l.96023-2.90909h1.07954L9.09091 11h-.85227l-.63637-2.10795h-.02272L6.94318 11Zm-.15909-1.14773h1.60227v.59093H6.78409v-.59093ZM9.37109 11V8.09091h1.25571c.2159 0 .4048.04261.5667.12784.162.08523.2879.20502.3779.35937.0899.15436.1349.33476.1349.5412 0 .20833-.0464.38873-.1392.54119-.0918.15246-.2211.26989-.3878.35229-.1657.0824-.3593.1236-.5809.1236h-.75003v-.61367h.59093c.0928 0 .1719-.0161.2372-.0483.0663-.03314.1169-.08002.152-.14062.036-.06061.054-.13211.054-.21449 0-.08334-.018-.15436-.054-.21307-.0351-.05966-.0857-.10511-.152-.13636-.0653-.0322-.1444-.0483-.2372-.0483h-.2784V11h-.78981Zm3.41481-2.90909V11h-.7898V8.09091h.7898Z"
                  />
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.31818 2c-.55228 0-1 .44772-1 1v.72878c-.06079.0236-.12113.04809-.18098.07346l-.55228-.53789c-.38828-.37817-1.00715-.37817-1.39543 0L3.30923 5.09564c-.19327.18824-.30229.44659-.30229.71638 0 .26979.10902.52813.30229.71637l.52844.51468c-.01982.04526-.03911.0908-.05785.13662H3c-.55228 0-1 .44771-1 1v2.58981c0 .5523.44772 1 1 1h.77982c.01873.0458.03802.0914.05783.1366l-.52847.5147c-.19327.1883-.30228.4466-.30228.7164 0 .2698.10901.5281.30228.7164l1.88026 1.8313c.38828.3781 1.00715.3781 1.39544 0l.55228-.5379c.05987.0253.12021.0498.18102.0734v.7288c0 .5523.44772 1 1 1h2.65912c.5523 0 1-.4477 1-1v-.7288c.1316-.0511.2612-.1064.3883-.1657l.5435.2614v.4339c0 .5523.4477 1 1 1H14v.0625c0 .5523.4477 1 1 1h.0909v.0625c0 .5523.4477 1 1 1h.6844l.4952.4823c1.1648 1.1345 3.0214 1.1345 4.1863 0l.2409-.2347c.1961-.191.3053-.454.3022-.7277-.0031-.2737-.1183-.5342-.3187-.7207l-6.2162-5.7847c.0173-.0398.0342-.0798.0506-.12h.7799c.5522 0 1-.4477 1-1V8.17969c0-.55229-.4478-1-1-1h-.7799c-.0187-.04583-.038-.09139-.0578-.13666l.5284-.51464c.1933-.18824.3023-.44659.3023-.71638 0-.26979-.109-.52813-.3023-.71637l-1.8803-1.8313c-.3883-.37816-1.0071-.37816-1.3954 0l-.5523.53788c-.0598-.02536-.1201-.04985-.1809-.07344V3c0-.55228-.4477-1-1-1H8.31818Z"
                  />
                </svg>

                <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                  Efficient Deployment
                </h3>
                <p className="text-gray-600">
                  Deploy models rapidly via a simple API or integrated
                  interface.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="bg-gray-50 py-20"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Explore Our Platform
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <Image
                  src="https://placehold.co/600x600"
                  alt="Data Upload Interface"
                  className="mb-4 rounded-lg"
                  width={600}
                  height={600}
                />
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  Data Upload
                </h3>
                <p className="text-gray-600">
                  Upload your CSV files or connect to your database
                  effortlessly.
                </p>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <Image
                  src="https://placehold.co/600x600"
                  alt="Data Upload Interface"
                  className="mb-4 rounded-lg"
                  width={600}
                  height={600}
                />
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  Model Configuration
                </h3>
                <p className="text-gray-600">
                  Configure your ML task with our automated model-building
                  pipeline.
                </p>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <Image
                  src="https://placehold.co/600x600"
                  alt="Data Upload Interface"
                  className="mb-4 rounded-lg"
                  width={600}
                  height={600}
                />
                <h3 className="mb-2 text-xl font-bold text-gray-800">
                  Performance Dashboard
                </h3>
                <p className="text-gray-600">
                  Monitor real-time metrics and analyze model performance.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white py-20"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="my-auto text-center md:col-span-2 md:text-left">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Our Mission to Democratize Machine Learning
            </h2>
            <p className="mb-8 text-xl text-gray-700">
              We believe that advanced machine learning should be accessible to
              every business. Born out of a passion for innovation, our platform
              leverages state-of-the-art automation to simplify complex ML
              tasks. Our expert team is committed to bridging the gap between
              cutting-edge AI and everyday business needs.
            </p>
          </div>
          <motion.img
            src="https://placehold.co/600x600"
            alt="Our Mission: Democratize Machine Learning"
            className="col-span-1 rounded-lg shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.section>

      <motion.section
        className="bg-blue-700 py-20"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto max-w-3xl  px-4 text-center text-white sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold">
            Unleash the Power of Automated ML in Your Organization
          </h2>
          <p className="mb-10 text-xl">
            Start your AI journey with our intuitive platform that automates
            complex ML tasks, saving you time and resources.
          </p>
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { yoyo: Infinity, duration: 0.5 },
            }}
          >
            <Button href="/app" color="light" className="mx-auto" size="lg">
              Start Your AI Journey
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
