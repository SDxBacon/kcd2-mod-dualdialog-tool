import { Avatar, Select, SelectItem } from "@heroui/react";
import GitHubButton from "./GitHubButton";
import NexusModsButton from "./NexusModsButton";

const animals = [
  { key: "en", label: "English" },
  { key: "zh-tw", label: "繁體中文" },
  { key: "zh-cn", label: "简体中文" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
];

function Navbar() {
  return (
    <div className="w-full flex items-center justify-end gap-2">
      {/* Language */}
      <Select
        className="max-w-xs"
        label="Favorite Animal"
        placeholder="Select an animal"
        // selectedKeys={value}
        variant="bordered"
        labelPlacement="outside-left"
        // onSelectionChange={setValue}
      >
        {animals.map((animal) => (
          <SelectItem key={animal.key}>{animal.label}</SelectItem>
        ))}
      </Select>
      {/* Nexus Mod Home Page */}
      <NexusModsButton
        size="medium"
        onClick={() => console.log("GitHub clicked")}
      />

      <GitHubButton
        size="medium"
        onClick={() => console.log("GitHub clicked")}
      />
      {/* GitHub Home Page */}
    </div>
  );
}

export default Navbar;
