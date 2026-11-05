import { generateClient } from 'aws-amplify/api';


import { getShoppingCart } from './queries';
import { FilterOptions } from './types';
const client = generateClient();




export const fetchData = async (objFilter: FilterOptions): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
       
      // console.log("--objFilter---", objFilter)
       
      const getData:any = await client.graphql({
        query: getShoppingCart,
        variables: { id: objFilter?.cartID },
      });
      // console.log("--getData---", getData)
      
      
      if (getData.errors?.length) {
        reject({ errorMessage: getData.errors[0]?.message ?? "GraphQL error" });
        return;
      }

      resolve(getData.data?.getV2ShoppingCart ?? null);
        
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
