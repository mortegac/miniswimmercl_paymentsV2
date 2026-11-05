import { generateClient } from 'aws-amplify/api';


import { listPaymentTransactions, paymentTransactionsByToken } from './queries';
import { FilterOptions } from './types';
const client = generateClient();




export const fetchData = async (objFilter: FilterOptions): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
       
      console.log("--objFilter---", objFilter)
       
      
      // const filterToken = (typeof objFilter?.token === 'undefined') ?
      // {} : { token: { eq: String(objFilter?.token) } };
      
      // // const filterStatus = { status: { eq: "AUTHORIZED" } };
      
      // const filter: any = {
      //   ...filterToken,
      //   // ...filterStatus,
      // };
      
      
      const getData:any = await client.graphql({
        query: paymentTransactionsByToken,
        // query: listPaymentTransactions,
        variables: { 
            token: objFilter?.token,
            // filter: {...filter}
            // , limit:1000000
        }
      });
      
      // const getData:any = await client.graphql({
      //   query: listPaymentTransactions,
      //   variables: { 
      //     token: objFilter?.token,
      //     status: "AUTHORIZED",
      //   },
      // });
      
      
      const cart = getData.data;
      // console.log("--cart---", cart)
      
        resolve({ ...cart.paymentTransactionsByToken.items[0]} as any);
        
        // ...userData.data.getUsers
      // } else {
      //   reject({
      //     errorMessage: errorMsg,
      //   });
      // }
    } catch (err) {
      reject(
        JSON.stringify({
          errorMessage: err,
        })
      );
    }
  });
};
