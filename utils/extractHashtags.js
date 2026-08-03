export const extractHashtags = (text) => {

  const matches = text.match(/#\w+/g);

  if (!matches) return [];

  return matches.map(tag =>
    tag.substring(1).toLowerCase()
  );
};