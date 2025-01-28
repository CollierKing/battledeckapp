import { findStringStart } from "@/lib/utils";

const TextResult = (contentStr: string, queryStr: string, regStyle: string) => {
  if (!queryStr || !contentStr) {
    return contentStr;
  }

  const [queryStrStart, queryStrEnd] = findStringStart(
    contentStr.toLowerCase(),
    queryStr.trim().toLowerCase()
  );

  if (
    queryStr.trim() !== "" &&
    queryStrStart >= 0 &&
    queryStrEnd > queryStrStart
  ) {
    return (
      <p className={regStyle}>
        {contentStr.slice(0, queryStrStart)}
        <span className={"bg-amber-500 underline decoration-blue-500"}>
          {contentStr.slice(queryStrStart, queryStrEnd)}
        </span>
        <a>{contentStr.slice(queryStrEnd)}</a>
      </p>
    );
  } else {
    return <p className={regStyle}>{contentStr}</p>;
  }
};

export default TextResult;
