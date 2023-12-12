function getDate() {
  return new Date().toLocaleTimeString();
}

function resolveAfter2Seconds() {
  console.log(getDate() + " starting slow promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("slow");
      console.log(getDate() + " slow promise is done");
    }, 2000);
  });
}

function resolveAfter1Second() {
  console.log(getDate() + " starting fast promise");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("fast");
      console.log(getDate() + " fast promise is done");
    }, 1000);
  });
}

async function test1() {
  const fast = await resolveAfter1Second();
  return Promise.reject("error");
  setTimeout(() => console.log(getDate() + " doing something"), 500);

  return fast;
}

async function test() {
  const results = await Promise.all([test1(), resolveAfter2Seconds()]);
  console.log(`${getDate()} ${results[0]}`);
  console.log(`${getDate()} ${results[1]}`);
}

test();
