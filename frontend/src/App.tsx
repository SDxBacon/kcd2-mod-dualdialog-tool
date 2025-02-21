import { useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import LanguageSelect from "@/components/LanguageSelect";
import "./App.css";
import { Greet } from "../wailsjs/go/main/App";

export const animals = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
  { key: "giraffe", label: "Giraffe" },
  { key: "dolphin", label: "Dolphin" },
  { key: "penguin", label: "Penguin" },
  { key: "zebra", label: "Zebra" },
  { key: "shark", label: "Shark" },
  { key: "whale", label: "Whale" },
  { key: "otter", label: "Otter" },
  { key: "crocodile", label: "Crocodile" },
];

function App() {
  return (
    <div id="App" className="bg-green-50">
      <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
        <LanguageSelect label="Select an animal" />

        <Select
          className="max-w-xs"
          label="Favorite Animal"
          placeholder="Select an animal"
        >
          {animals.map((animal) => (
            <SelectItem key={animal.key}>{animal.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default App;
