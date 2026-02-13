import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Kevin M",
    role: "Verified Customer",
    content:
      "Genuinely great Sanwa parts — it’s brilliant to buy genuine parts from a UK supplier and avoid the knockoff gamble.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah C",
    role: "Game Room Owner",
    content:
      "Fast shipping and excellent customer service. They helped me find the exact joystick I needed for my custom build. Highly recommend!",
    rating: 5,
  },
  {
    id: 3,
    name: "David M",
    role: "DIY Enthusiast",
    content:
      "As someone new to arcade building, their detailed guides and quality parts made my first project a success. Can't wait to order more!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="
        py-20
        bg-pink-50 dark:bg-gray-900
        border-y-2 border-black dark:border-gray-700
        text-black dark:text-white
        transition-colors
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="
            text-4xl font-bold mb-4
            text-black dark:text-white
          "
          >
            What Our <span className="text-pink-600">Customers Say</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="
                bg-white dark:bg-gray-800
                border-2 border-black dark:border-gray-700
                p-6
                hover:shadow-xl dark:hover:bg-gray-700
                transition-all duration-300
              "
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-pink-600 text-pink-600"
                  />
                ))}
              </div>

              {/* Content */}
              <p
                className="
                text-gray-700 dark:text-gray-300
                mb-6 italic
              "
              >
                {testimonial.content}
              </p>

              {/* Author */}
              <div
                className="
                border-t-2 border-black dark:border-gray-700
                pt-4
              "
              >
                <p
                  className="
                  font-bold
                  text-black dark:text-white
                "
                >
                  {testimonial.name}
                </p>

                <p
                  className="
                  text-sm
                  text-gray-600 dark:text-gray-400
                "
                >
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
