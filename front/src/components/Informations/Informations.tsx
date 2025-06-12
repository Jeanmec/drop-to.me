import Accordion from "@/components/Elements/Accordion";

const Informations = () => {
  const accordionItems = [
    {
      title: "Informations",
      content:
        "This is the information section where you can find details about the application.",
    },
    {
      title: "Settings",
      content: "Here you can adjust your preferences and settings.",
    },
    {
      title: "Help",
      content: "Need assistance? Check out our help section for guidance.",
    },
    {
      title: "About",
      content: "Learn more about this application and its features.",
    },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      id="informations"
    >
      <Accordion items={accordionItems} />
    </div>
  );
};

export default Informations;
