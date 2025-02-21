import { Selector } from "@rewind-ui/core";

function LanguageSelector() {
  return (
    <Selector value="apple">
      <Selector.Tab anchor="apple" label="Apple" />
      <Selector.Tab anchor="orange" label="Orange" />
      <Selector.Tab anchor="banana" label="Banana" />
    </Selector>
  );
}

export default LanguageSelector;
