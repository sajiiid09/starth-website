import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Loader2, Wand2 } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { GeneratedCaption } from "@/api/entities";

export default function CaptionMaker({ eventId, onUpdate }) {
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState("Instagram");
  const [tone, setTone] = useState("Professional");
  const [captions, setCaptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCaptions([]);
    const prompt = `Generate 3 distinct social media captions for an event.
Goal: ${goal}
Channel: ${channel}
Tone: ${tone}
For each caption, provide the caption text and 3-5 relevant hashtags.`;

    try {
      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            captions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  caption_text: { type: "string" },
                  hashtags: { type: "string" }
                }
              }
            }
          }
        }
      });
      setCaptions(result.captions);
    } catch (error) {
      console.error("Error generating captions:", error);
    }
    setIsLoading(false);
  };
  
  const handleSave = async (caption) => {
    await GeneratedCaption.create({ event_id: eventId, ...caption, goal, channel, tone });
    // Maybe show a toast notification
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          AI Caption Maker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="What's the goal? (e.g., 'Early-bird promo')" value={goal} onChange={e => setGoal(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Email Header">Email Header</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Fun">Fun</SelectItem>
              <SelectItem value="Minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !goal} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
          Generate Captions
        </Button>
        <div className="space-y-3 pt-4">
          {captions.map((caption, index) => (
            <Card key={index} className="bg-gray-50">
              <CardContent className="p-3">
                <Textarea defaultValue={caption.caption_text} className="mb-2" />
                <p className="text-xs text-blue-600">{caption.hashtags}</p>
                <Button variant="link" size="sm" onClick={() => handleSave(caption)}>Save to library</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}