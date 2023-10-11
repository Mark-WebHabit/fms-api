const getDT = () => {
  const currentDate = new Date();
  const formattedDateTime = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  return formattedDateTime;
};

export default getDT;
