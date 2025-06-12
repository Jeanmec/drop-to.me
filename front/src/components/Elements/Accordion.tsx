interface AccordionProps {
  title: string;
  content: string;
}

interface AccordionComponentProps {
  items: AccordionProps[];
}

const Accordion: React.FC<AccordionComponentProps> = ({ items }) => {
  return (
    <>
      {items.map((item, index) => (
        <div
          key={index}
          className="collapse-arrow bg-base-100 border-base-300 collapse border"
        >
          <input
            type="radio"
            name="my-accordion"
            defaultChecked={index === 0}
          />
          <div className="collapse-title font-semibold">{item.title}</div>
          <div className="collapse-content text-sm">{item.content}</div>
        </div>
      ))}
    </>
  );
};

export default Accordion;
