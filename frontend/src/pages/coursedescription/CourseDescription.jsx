import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

  const { fetchUser } = UserData();

  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return "";
    const url = rawUrl.trim();

    if (url.includes("youtube.com/embed/")) return url;

    const idMatch =
      url.match(/(?:v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([^&?/]+)/i);
    if (idMatch && idMatch[1]) {
      return `https://www.youtube.com/embed/${idMatch[1].trim()}?rel=0&modestbranding=1`;
    }

    return url;
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (window.Razorpay) return resolve(true);
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => reject(false));
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  };

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded || !window.Razorpay) {
        toast.error(
          "Razorpay checkout could not load. Please disable ad-blockers or try again in a supported browser."
        );
        setLoading(false);
        return;
      }

      const {
        data: { order, key },
      } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      if (!key || !order?.id) {
        throw new Error("Payment configuration is incomplete.");
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "E learning",
        description: "Learn with us",
        order_id: order.id,

        handler: async function (response) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;

          try {
            const { data } = await axios.post(
              `${server}/api/verification/${params.id}`,
              {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              {
                headers: {
                  token,
                },
              }
            );

            await fetchUser();
            await fetchCourses();
            await fetchMyCourse();
            toast.success(data.message);
            setLoading(false);
            navigate(`/payment-success/${razorpay_payment_id}`);
          } catch (error) {
            const message = error?.response?.data?.message || "Payment verification failed.";
            toast.error(message);
            setLoading(false);
          }
        },
        theme: {
          color: "#8a4baf",
        },
      };
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Unable to start payment.";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={`${server}/${course.image}`}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration} weeks</p>
                </div>
              </div>

              <p>{course.description}</p>

              <p>Let's get started with course At ₹{course.price}</p>

              {course.videoUrl && (
                <button
                  onClick={() => setSelectedVideoUrl(course.videoUrl)}
                  className="common-btn video-btn"
                >
                  Watch Related Video
                </button>
              )}

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}
            </div>
          )}
        </>
      )}

      {selectedVideoUrl && (
        <div className="video-modal" onClick={() => setSelectedVideoUrl("")}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-video" onClick={() => setSelectedVideoUrl("")}>
              ×
            </button>
            <iframe
              src={getEmbedUrl(selectedVideoUrl)}
              title="Related course video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDescription;
