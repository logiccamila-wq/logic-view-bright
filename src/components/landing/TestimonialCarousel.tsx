import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  photo?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  rotateInterval?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Carlos Mendes",
    role: "Diretor de Operações",
    company: "TransLog Brasil",
    quote: "A xyzlogicflow transformou nossa operação. Reduzimos custos em 35% e aumentamos a eficiência em tempo real.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ana Paula Silva",
    role: "Gerente de Logística",
    company: "Rodocar Transportes",
    quote: "Plataforma intuitiva e completa. O suporte técnico é excepcional, sempre prontos para ajudar.",
    rating: 5,
  },
  {
    id: 3,
    name: "Roberto Ferreira",
    role: "CEO",
    company: "Expresso Norte",
    quote: "ROI positivo em 3 meses. A integração com nossos sistemas foi perfeita e sem dores de cabeça.",
    rating: 5,
  },
];

/**
 * Testimonials carousel with auto-rotate and manual controls
 * Displays customer reviews with photos, ratings, and quotes
 */
export function TestimonialCarousel({
  testimonials = defaultTestimonials,
  autoRotate = true,
  rotateInterval = 5000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  // Handle empty testimonials
  if (testimonials.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        No testimonials available
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Testimonial */}
      <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 lg:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Quote Icon */}
            <div className="mb-6 text-indigo-600 dark:text-indigo-400 opacity-20">
              <Quote className="w-16 h-16" />
            </div>

            {/* Quote Text */}
            <blockquote className="text-xl lg:text-2xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < currentTestimonial.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Author Info */}
            <div className="flex flex-col items-center">
              {currentTestimonial.photo ? (
                <img
                  src={currentTestimonial.photo}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full mb-4 border-2 border-indigo-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {currentTestimonial.name.charAt(0)}
                </div>
              )}
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {currentTestimonial.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {currentTestimonial.role}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentTestimonial.company}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="hover:bg-white/20 rounded-full"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-indigo-600 dark:bg-indigo-400 w-8"
                    : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="hover:bg-white/20 rounded-full"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
