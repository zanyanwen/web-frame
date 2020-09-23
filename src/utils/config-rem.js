const configRem = (designWidth = 375, initial = true) => {
  const windowWidth = window.innerWidth;
  const fontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  document.documentElement.style.fontSize = `${(windowWidth / designWidth) * 100}px`;
  if (initial) document.body.style.fontSize = `${fontSize / 100}rem`;

  window.onresize = configRem.bind(null, designWidth, false);
};

export default configRem;
