export type StarterTemplate = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
};

export const starterTemplates: StarterTemplate[] = [
  {
    id: "product-launch",
    title: "Product Launch Blueprint",
    description: "Premium launch sequencing with keynote, demos, and networking arcs.",
    imageUrl:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "executive-summit",
    title: "Executive Summit Blueprint",
    description: "Two-day summit structure with focused sessions and VIP hospitality.",
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "brand-evening",
    title: "Brand Evening Blueprint",
    description: "Curated evening flow from guest arrival to storytelling close.",
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600"
  }
];
