interface ButtonTabProps {
  refs: any;
  name: string;
}

export default function ButtonTab({ refs, name }: ButtonTabProps) {
  return (
    <button
      type="button"
      className="button-tab"
      data-name={name}
      ref={(el) => {
        if (el && !refs.current.includes(el)) {
          refs.current.push(el);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        refs.current.forEach((btn: any) => {
          if (btn?.dataset.name === name) {
            if (btn.classList.contains("run")) {
              btn.classList.remove("run");
              const hiddenElements = [
                ...btn?.nextElementSibling.querySelectorAll(".button-tab"),
              ];

              if (hiddenElements.length > 0) {
                hiddenElements.forEach((element) => {
                  element.classList.remove("run");
                });
              }
            } else {
              btn.classList.add("run");
            }
          }
        });
      }}
    >
      {name}
    </button>
  );
}
