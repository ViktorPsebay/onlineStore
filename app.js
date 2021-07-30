import express from 'express';
import { sequelize } from './models/user.js';
import router from './router/router.js';

const app = express();


app.use(express.json());
app.use(router);

sequelize.sync().then(()=>{
  app.listen(3000, function(){
    console.log('server has been started on port 3000');
  });
}).catch(err=>console.log(err));
