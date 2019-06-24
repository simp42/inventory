exports = function(arg){
  const admins = context.values.get("adminUsers");
  const user = context.user.id;
  let found = false;
  for(let i = 0; i < admins.length; i++) {
    if (admins[i] === user) {
      return true;
    }
  }
  
  return false;
};